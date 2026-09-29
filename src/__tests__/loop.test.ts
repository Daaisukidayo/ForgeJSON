import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { bot, failure, json, output } from "./support/harness"

const env = () => ({
    users: [
        { id: "123456789012345678", xp: 5 },
        { id: "2", xp: 50 },
        { id: "3", xp: 500 },
    ],
})

describe("$arrayMap", () => {
    it("collects what the code outputs, no $return needed", async () => {
        assert.deepEqual(await json("$arrayMap[users;u;$jsonGet[u;xp]]", env()), [5, 50, 500])
    })

    it("collects what $return gives", async () => {
        assert.deepEqual(await json("$arrayMap[users;u;$return[$jsonGet[u;xp]]ignored]", env()), [5, 50, 500])
    })

    it("still skips a run that returns nothing, so $if and $return filter as they always did", async () => {
        const code = "$arrayMap[users;u;$if[$jsonGet[u;xp]>10;$return[$jsonGet[u;xp]]]]"
        assert.deepEqual(await json(code, env()), [50, 500])
    })

    it("keeps IDs exact", async () => {
        const vars = { users: [{ id: "123456789012345678" }, { id: "876543210987654321" }] }
        assert.deepEqual(await json("$arrayMap[users;u;$jsonGet[u;id]]", vars), [
            "123456789012345678",
            "876543210987654321",
        ])
    })

    it("reads what the code outputs the way $jsonSet reads a value", async () => {
        assert.deepEqual(await json("$arrayMap[users;u;$jsonGet[u;id]]", env()), ["123456789012345678", 2, 3])
    })

    it("loads to another variable, and hands out the index last", async () => {
        const vars: Record<string, unknown> = env()

        assert.equal(await output("$arrayMap[users;u;$objectOf[place;$jsonGet[i];xp;$jsonGet[u;xp]];out;i]", vars), "")
        assert.deepEqual(vars.out, [
            { place: 0, xp: 5 },
            { place: 1, xp: 50 },
            { place: 2, xp: 500 },
        ])
    })

    it("gives the variables back as they were", async () => {
        const vars: Record<string, unknown> = { ...env(), u: "mine" }
        await output("$arrayMap[users;u;x;;i]", vars)

        assert.equal(vars.u, "mine")
        assert.equal("i" in vars, false, "a variable that wasn't there is gone again")
    })

    it("nests under the same variable name, and reads JSON", async () => {
        const code = String.raw`$arrayMap[[[1,2\],[3\]\];row;$arraySum[$arrayMap[row;row;$jsonGet[row]]]]`
        assert.deepEqual(await json(code), [3, 3])
    })
})

describe("$arrayFilter", () => {
    it("keeps the elements a condition holds for", async () => {
        assert.deepEqual(await json("$arrayPluck[$arrayFilter[users;u;$jsonGet[u;xp]>=50];id]", env()), ["2", "3"])
    })

    it("reads a bare true or false too", async () => {
        const vars = { list: [{ on: true }, { on: false }] }
        assert.deepEqual(await json("$arrayFilter[list;x;$jsonGet[x;on]]", vars), [{ on: true }])
    })

    it("loads to another variable, and hands out the index last", async () => {
        const vars: Record<string, unknown> = { list: ["a", "b", "c", "d"] }
        await output("$arrayFilter[list;x;$modulo[$jsonGet[i];2]==0;even;i]", vars)

        assert.deepEqual(vars.even, ["a", "c"])
    })
})

describe("$arrayForEach", () => {
    it("changes the source through the variable", async () => {
        const vars = env()
        await output("$arrayForEach[users;u;$jsonMath[u;xp;1]]", vars)

        assert.deepEqual(
            vars.users.map((user) => user.xp),
            [6, 51, 501]
        )
    })

    it("hands out the index", async () => {
        const vars: Record<string, unknown> = { ...env(), places: [] }
        await output("$arrayForEach[users;u;$arrayPush[places;$jsonGet[i]];i]", vars)

        assert.deepEqual(vars.places, [0, 1, 2])
    })

    it("passes an error on and still gives the variable back", async () => {
        const vars: Record<string, unknown> = { ...env(), u: "mine" }

        assert.match(await failure("$arrayForEach[users;u;$jsonMath[u;id;x;1]]", vars), /has no key/)
        assert.equal(vars.u, "mine")
    })
})

describe("$arrayFind, $arrayFindIndex and $arrayCount", () => {
    it("read JSON as well as a variable", async () => {
        assert.equal(await output(String.raw`$arrayFind[[3,8,12\];n;$jsonGet[n]>5]`), "8")
        assert.equal(await output(String.raw`$arrayFindIndex[[3,8,12\];n;$jsonGet[n]>5]`), "1")
        assert.equal(await output(String.raw`$arrayCount[[3,8,12\];n;$jsonGet[n]>5]`), "2")
    })

    it("hand out the index", async () => {
        assert.equal(await output(String.raw`$arrayCount[["a","b","c"\];x;$jsonGet[i]>0;i]`), "2")
    })
})

describe("$arraySome, $arrayEvery, $arrayFindLast and $arrayFindLastIndex", () => {
    it("read JSON as well as a variable", async () => {
        assert.equal(await output(String.raw`$arraySome[[3,8,12\];n;$jsonGet[n]>10]`), "true")
        assert.equal(await output(String.raw`$arrayEvery[[3,8,12\];n;$jsonGet[n]>5]`), "false")
        assert.equal(await output(String.raw`$arrayFindLast[[3,8,12\];n;$jsonGet[n]<10]`), "8")
        assert.equal(await output(String.raw`$arrayFindLastIndex[[3,8,12\];n;$jsonGet[n]<10]`), "1")
    })

    it("read the condition the way $if does, $arrayEvery included", async () => {
        assert.equal(await output("$arrayEvery[users;u;$jsonGet[u;xp]>0]", env()), "true")
        assert.equal(await output("$arrayEvery[users;u;$checkCondition[$jsonGet[u;xp]>0]]", env()), "true")
    })

    it("answer an empty array the way JavaScript does", async () => {
        const empty = String.raw`[\]`
        assert.equal(
            await output(
                `$arraySome[${empty};n;true] $arrayEvery[${empty};n;false] $arrayFindLastIndex[${empty};n;true]`
            ),
            "false true -1"
        )
        assert.equal(await output(`$arrayFindLast[${empty};n;true]`), "")
    })

    it("stop at the element that settles the answer, the last ones looking from the end", async () => {
        const vars: Record<string, unknown> = { ...env(), seen: [] }
        await output("$arrayEvery[users;u;$arrayPush[seen;$jsonGet[u;xp]]$jsonGet[u;xp]<10]", vars)
        assert.deepEqual(vars.seen, [5, 50])

        vars.seen = []
        assert.equal(
            await output("$arrayFindLastIndex[users;u;$arrayPush[seen;$jsonGet[u;xp]]$jsonGet[u;xp]<100]", vars),
            "1"
        )
        assert.deepEqual(vars.seen, [500, 50])
    })

    it("hand out the index", async () => {
        assert.equal(await output(String.raw`$arraySome[["a","b"\];x;$jsonGet[i]==1;i]`), "true")
    })
})

describe("$arrayReduce", () => {
    it("carries what the code outputs from one element to the next, starting from 0", async () => {
        assert.equal(await output("$arrayReduce[users;sum;u;$math[$env[sum]+$jsonGet[u;xp]]]", env()), "555")
    })

    it("takes $return as ForgeScript's own does", async () => {
        assert.equal(
            await output("$arrayReduce[users;sum;u;$return[$math[$env[sum]+$jsonGet[u;xp]]]ignored;5]", env()),
            "560"
        )
    })

    it("starts from any value, and carries text, arrays and changes made through the variable", async () => {
        assert.equal(await output(String.raw`$arrayReduce[["a","b","c"\];text;w;$env[text]$env[w];""]`), "abc")
        assert.deepEqual(
            await json(String.raw`$arrayReduce[users;list;u;$arrayPush[list;$jsonGet[u;xp]];[\]]`, env()),
            [5, 50, 500]
        )
    })

    it("keeps the value as it was when the code outputs nothing", async () => {
        assert.equal(
            await output("$arrayReduce[users;most;u;$if[$jsonGet[u;xp]>$env[most];$return[$jsonGet[u;xp]]]]", env()),
            "500"
        )
    })
})

describe("$break and $continue", () => {
    const loops = [
        "$arrayForEach[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]]",
        "$arrayMap[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]$jsonGet[u;xp]]",
        "$arrayFilter[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]true]",
        "$arrayFind[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayFindIndex[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayFindLast[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayFindLastIndex[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayCount[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]true]",
        "$arraySome[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayEvery[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]true]",
        "$arrayReduce[users;sum;u;$if[$jsonGet[u;xp]==50;SIGNAL]1]",
    ]

    it("fail the command outside a loop, as in ForgeScript's own array functions", async () => {
        for (const loop of loops) {
            assert.match(
                await failure(loop.replace("SIGNAL", "$break"), env()),
                /Break statements are not allowed/,
                loop
            )
            assert.match(await failure(loop.replace("SIGNAL", "$continue"), env()), /Continue statements are not/, loop)
        }
    })

    it("go on to the loop around them, as they would out of a JavaScript forEach", async () => {
        const inner = "$arrayForEach[users;u;$arrayPush[log;$jsonGet[u;xp]]$if[$jsonGet[u;xp]==50;SIGNAL]]"
        const vars: Record<string, unknown> = { ...env(), log: [] }

        await output(`$loop[2;${inner.replace("SIGNAL", "$break")}$arrayPush[log;after]]`, vars)
        assert.deepEqual(vars.log, [5, 50], "$break ended the $loop")

        vars.log = []
        await output(`$loop[2;${inner.replace("SIGNAL", "$continue")}$arrayPush[log;after]]`, vars)
        assert.deepEqual(vars.log, [5, 50, 5, 50], "$continue moved the $loop on")
    })

    it("leave no loop variable behind, and give back the ones there were", async () => {
        for (const loop of loops) {
            const vars: Record<string, unknown> = { ...env(), u: "mine" }
            await bot.run(loop.replace("SIGNAL", "$break"), vars)

            assert.equal(vars.u, "mine", loop)
            assert.equal("sum" in vars, false, loop)
        }
    })
})

describe("an array that grows during the loop", () => {
    const grow = "$arrayPush[runs;1]$if[$arrayLength[items]<10;$arrayPush[items;1]]"
    const loops = [
        `$arrayForEach[items;x;${grow}]`,
        `$arrayMap[items;x;${grow}]`,
        `$arrayReduce[items;acc;x;${grow}]`,
        `$arrayFilter[items;x;${grow}true]`,
        `$arraySome[items;x;${grow}false]`,
        `$arrayEvery[items;x;${grow}true]`,
        `$arrayFindLast[items;x;${grow}false]`,
    ]

    it("is gone over only as far as it reached when the loop started, as in ForgeScript's own", async () => {
        for (const loop of loops) {
            const vars: Record<string, unknown> = { items: [0], runs: [] }
            await output(loop, vars)

            assert.equal((vars.runs as unknown[]).length, 1, loop)
        }
    })
})
