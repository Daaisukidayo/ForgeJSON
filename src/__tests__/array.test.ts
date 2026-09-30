import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { failure, json, output } from "./support/harness"

describe("$arrayOf", () => {
    it("builds an array, typing the values", async () => {
        assert.deepEqual(await json("$arrayOf[1;two;true;null;007]"), [1, "two", true, null, "007"])
        assert.equal(await output("$arrayOf"), "[]")
    })
})

describe("$arrayPush and $arrayUnshift", () => {
    it("create the array, keep the order, and return nothing", async () => {
        const env: Record<string, unknown> = {}

        assert.equal(await output("$arrayPush[items;sword;shield]$arrayUnshift[items;helmet]", env), "")
        assert.deepEqual(env.items, ["helmet", "sword", "shield"])
    })

    it("store numbers and booleans as such, IDs and JSON as they are", async () => {
        const env: Record<string, unknown> = {}
        await output(String.raw`$arrayPush[list;5;true;123456789012345678;{"a":1};[1,2\]]`, env)

        assert.deepEqual(env.list, [5, true, "123456789012345678", { a: 1 }, [1, 2]])
    })

    it("refuse what isn't an array", async () => {
        assert.match(await failure("$arrayPush[d;x]", { d: {} }), /is an object, not an array/)
    })
})

describe("$arrayPushJSON and $arrayUnshiftJSON", () => {
    it("add JSON values, creating the array and keeping IDs exact", async () => {
        const env: Record<string, unknown> = {}
        await output(
            String.raw`$arrayPushJSON[list;{"id":123456789012345678};[1,2\]]$arrayUnshiftJSON[list;123456789012345678;null]`,
            env
        )

        assert.deepEqual(env.list, ["123456789012345678", null, { id: "123456789012345678" }, [1, 2]])
    })

    it("refuse JSON that doesn't parse, adding nothing", async () => {
        const env: Record<string, unknown> = { list: [] }

        assert.match(await failure("$arrayPushJSON[list;1;{a:1}]", env), /not valid JSON/)
        assert.deepEqual(env.list, [])
    })

    it("refuse what isn't an array", async () => {
        assert.match(await failure("$arrayUnshiftJSON[d;1]", { d: {} }), /is an object, not an array/)
    })
})

describe("$arrayPop and $arrayShift", () => {
    it("remove and return an element", async () => {
        const env: Record<string, unknown> = { queue: [{ id: 1 }, 2, 3] }

        assert.equal(await output("$arrayShift[queue]|$arrayPop[queue]", env), '{"id":1}|3')
        assert.deepEqual(env.queue, [2])
    })

    it("return nothing for a missing array, and refuse JSON", async () => {
        assert.equal(await output("$arrayPop[none]$arrayShift[none]"), "")
        assert.match(await failure(String.raw`$arrayPop[[1\]]`), /only a variable can be written to/)
    })
})

describe("$arrayRemove", () => {
    it("removes every match of the same type, in place", async () => {
        const list = ["5", 5, 6, { id: 1 }, "x", 5]

        assert.equal(await output(`$arrayRemove[list;5;{"id":1}]`, { list }), "")
        assert.deepEqual(list, ["5", 6, "x"], "the text 5 is not the number 5")

        await output(`$arrayRemove[list;"5"]`, { list })
        assert.deepEqual(list, [6, "x"])
    })

    it("leaves a missing variable missing", async () => {
        const env: Record<string, unknown> = {}

        assert.equal(await output("$arrayRemove[list;5]", env), "")
        assert.deepEqual(env, {})
    })
})

describe("$arraySplice", () => {
    it("removes and inserts, typing what it inserts, and returns what it removed", async () => {
        const env: Record<string, unknown> = { list: ["a", "b", "c"] }

        assert.equal(await output("$arraySplice[list;1;1;5;true]", env), '["b"]')
        assert.deepEqual(env.list, ["a", 5, true, "c"])
    })

    it("counts a negative index from the end, and creates a missing array", async () => {
        const env: Record<string, unknown> = { list: [1, 2, 3] }

        assert.equal(await output("$arraySplice[list;-1;1]", env), "[3]")
        assert.equal(await output("$arraySplice[added;0;0;x]", env), "[]")
        assert.deepEqual(env, { list: [1, 2], added: ["x"] })
    })

    it("refuses what isn't an array", async () => {
        assert.match(await failure("$arraySplice[d;0;1]", { d: "text" }), /is a string, not an array/)
    })
})

describe("$arraySlice, $arrayReverse and $arrayJoin", () => {
    it("slice from either end, 0 as the end meaning the end", async () => {
        const env = { list: [1, 2, 3, 4] }

        assert.deepEqual(await json("$arraySlice[list;;1;3]", env), [2, 3])
        assert.deepEqual(await json("$arraySlice[list;;-2]", env), [3, 4])
        assert.deepEqual(await json("$arraySlice[list;;1;0]", env), [2, 3, 4])
    })

    it("slice into another variable", async () => {
        const env: Record<string, unknown> = { list: [1, 2, 3] }

        assert.equal(await output("$arraySlice[list;top;0;2]", env), "")
        assert.deepEqual(env.top, [1, 2])
    })

    it("reverse a variable in place, and JSON into the output", async () => {
        const env: Record<string, unknown> = { list: [1, 2, 3] }

        assert.deepEqual(await json("$arrayReverse[list]", env), [3, 2, 1])
        assert.deepEqual(env.list, [3, 2, 1])
        assert.deepEqual(await json(String.raw`$arrayReverse[["a","b"\]]`), ["b", "a"])
    })

    it("leave the variable as it is when the reversed array goes to another one", async () => {
        const env: Record<string, unknown> = { list: [1, 2, 3] }

        assert.equal(await output("$arrayReverse[list;back]$arrayPush[back;4]", env), "")
        assert.deepEqual(env.list, [1, 2, 3])
        assert.deepEqual(env.back, [3, 2, 1, 4], "a copy of its own, not the same array")
    })

    it("join objects as JSON rather than [object Object]", async () => {
        assert.equal(await output(String.raw`$arrayJoin[[{"n":1},2,null\]]`), '{"n":1}, 2, ')
        assert.equal(await output("$arrayJoin[list;]", { list: [1, 2] }), "12", "an empty separator joins without one")
    })
})

describe("$arrayIncludes, $arrayIndexOf and $arrayLastIndexOf", () => {
    it("find the last match the same way, in JSON too", async () => {
        const env = { list: [5, "5", 5] }

        assert.equal(
            await output(`$arrayLastIndexOf[list;5] $arrayLastIndexOf[list;"5"] $arrayLastIndexOf[list;6]`, env),
            "2 1 -1"
        )
        assert.equal(await output(String.raw`$arrayLastIndexOf[[{"a":1},{"a":1}\];{"a":1}]`), "1")
    })

    it("tell a number from the same number as text", async () => {
        const env = { number: [5], text: ["5"] }

        assert.equal(await output(`$arrayIncludes[number;5] $arrayIncludes[number;"5"]`, env), "true false")
        assert.equal(await output(`$arrayIncludes[text;5] $arrayIncludes[text;"5"]`, env), "false true")
        assert.equal(
            await output(`$arrayIndexOf[number;5] $arrayIndexOf[text;5] $arrayIndexOf[text;"5"]`, env),
            "0 -1 0"
        )
    })

    it("tell true from the text true, and null from the text null", async () => {
        const env = { list: ["true", null] }
        assert.equal(
            await output(`$arrayIndexOf[list;true] $arrayIndexOf[list;"true"] $arrayIndexOf[list;null]`, env),
            "-1 0 1"
        )
    })

    it("find objects by what they hold, and IDs exactly", async () => {
        const env = { list: [{}, { a: 1, b: 2 }], ids: ["123456789012345678"] }

        assert.equal(await output(`$arrayIndexOf[list;{"b":2,"a":1}]`, env), "1")
        assert.equal(
            await output("$arrayIncludes[ids;123456789012345678] $arrayIncludes[ids;123456789012345679]", env),
            "true false"
        )
    })
})

describe("$arrayRange", () => {
    it("counts from start to end, both included", async () => {
        assert.deepEqual(await json("$arrayRange[1;5]"), [1, 2, 3, 4, 5])
        assert.deepEqual(await json("$arrayRange[5;1]"), [5, 4, 3, 2, 1])
        assert.deepEqual(await json("$arrayRange[0;10;5]"), [0, 5, 10])
        assert.deepEqual(await json("$arrayRange[0;0.3;0.1]"), [0, 0.1, 0.2, 0.3], "without 0.30000000000000004")
        assert.deepEqual(await json("$arrayRange[1;5;-1]"), [], "a step pointing away gives nothing")
    })

    it("refuses a step of 0, and builds a range of any length", async () => {
        assert.match(await failure("$arrayRange[1;5;0]"), /step of 0/)
        assert.equal((await json("$arrayRange[1;100000]")).length, 100_000)
    })
})

describe("$arrayChunk, $arrayPage and $arrayPageCount", () => {
    const env = { list: [1, 2, 3, 4, 5] }

    it("split, page and count pages", async () => {
        assert.deepEqual(await json("$arrayChunk[list;2]", env), [[1, 2], [3, 4], [5]])
        assert.deepEqual(await json("$arrayPage[list;3;2]", env), [5])
        assert.deepEqual(await json("$arrayPage[list;9;2]", env), [])
        assert.equal(await output("$arrayPageCount[list;2] $arrayPageCount[none;10]", env), "3 1")
    })

    it("refuse a page or a size that can't be", async () => {
        assert.match(await failure("$arrayPage[list;0;2]", env), /pages start at 1/)
        assert.match(await failure("$arrayChunk[list;0]", env), /can't hold 0/)
    })
})

describe("$arraySample, $arrayShuffle and $arrayWeightedRandom", () => {
    it("pick different elements", async () => {
        const env = { list: [1, 2, 3, 4, 5] }
        const picked: number[] = await json("$arraySample[list;3]", env)

        assert.equal(new Set(picked).size, 3, "no element twice")
        assert.ok(picked.every((n) => env.list.includes(n)))
        assert.ok(env.list.includes(Number(await output("$arraySample[list]", env))))
    })

    it("shuffle a variable in place and JSON into the output, losing nothing", async () => {
        const list = [1, 2, 3, 4, 5]

        assert.equal(await output("$arrayShuffle[list]", { list }), "", "in place, nothing returned")
        assert.deepEqual([...list].sort(), [1, 2, 3, 4, 5])
        assert.deepEqual((await json(String.raw`$arrayShuffle[[1,2,3\]]`)).sort(), [1, 2, 3])
    })

    it("never pick an element weighing nothing", async () => {
        const env = { table: [{ item: "common", chance: 0 }, { item: "rare", chance: 1 }, { item: "junk" }] }

        for (let i = 0; i < 20; i++) assert.equal((await json("$arrayWeightedRandom[table;chance]", env)).item, "rare")
        assert.equal(await output(String.raw`$arrayWeightedRandom[[{"chance":0}\];chance]`), "")
    })

    it("pick as often as the weights say", async () => {
        const env = {
            table: [
                { item: "a", chance: 1 },
                { item: "b", chance: 3 },
            ],
        }
        let b = 0

        for (let i = 0; i < 2000; i++) if ((await json("$arrayWeightedRandom[table;chance]", env)).item === "b") b++

        assert.ok(b > 1300 && b < 1700, `b came up ${b} times in 2000`)
    })
})

describe("$arrayRandomIndex", () => {
    it("picks an index of the array, and nothing from an empty one", async () => {
        for (let i = 0; i < 20; i++) {
            const index = await output("$arrayRandomIndex[list]", { list: ["a", "b", "c"] })
            assert.ok(["0", "1", "2"].includes(index ?? ""), `picked ${index}`)
        }

        assert.equal(await output("[$arrayRandomIndex[list]]", { list: [] }), "[]")
        assert.equal(await output(String.raw`$arrayRandomIndex[["x"\]]`), "0")
    })
})

describe("$arrayFill", () => {
    it("gives every element its own copy of the value", async () => {
        const env: Record<string, unknown> = {}
        await output(`$arrayCreate[slots;3]$arrayFill[slots;{"item":null}]$jsonSet[slots;0;item;sword]`, env)

        assert.deepEqual(env.slots, [{ item: "sword" }, { item: null }, { item: null }])
    })

    it("keeps IDs exact and refuses JSON that doesn't parse", async () => {
        const env: Record<string, unknown> = { ids: [0, 0] }
        await output("$arrayFill[ids;123456789012345678]", env)

        assert.deepEqual(env.ids, ["123456789012345678", "123456789012345678"])
        assert.match(await failure("$arrayFill[ids;{a:1}]", env), /not valid JSON/)
    })

    it("leaves a missing variable missing, and refuses what isn't an array", async () => {
        const env: Record<string, unknown> = { text: "x" }

        assert.equal(await output("$arrayFill[slots;0]", env), "")
        assert.deepEqual(env, { text: "x" })
        assert.match(await failure("$arrayFill[text;0]", env), /is a string, not an array/)
    })
})

describe("$arrayFlat, $arrayUnique and the set functions", () => {
    it("flatten to a depth", async () => {
        assert.deepEqual(await json(String.raw`$arrayFlat[[1,[2,[3\]\]\]]`), [1, 2, [3]])
        assert.deepEqual(await json(String.raw`$arrayFlat[[1,[2,[3\]\]\];Infinity]`), [1, 2, 3])
    })

    it("drop repeats, whole or by a key, into another variable too", async () => {
        const env: Record<string, unknown> = {
            users: [{ id: 1, n: "a" }, { id: 1, n: "b" }, { id: 2 }],
            nums: [1, 1, "1", { a: 1 }, { a: 1 }],
        }

        assert.deepEqual(await json("$arrayUnique[users;;id]", env), [{ id: 1, n: "a" }, { id: 2 }])
        assert.deepEqual(
            await json("$arrayUnique[nums]", env),
            [1, "1", { a: 1 }],
            "1 and '1' are different values here"
        )

        await output("$arrayUnique[nums;once]", env)
        assert.deepEqual(env.once, [1, "1", { a: 1 }])
    })

    it("combine sets", async () => {
        const env = { a: [1, 2, 2, 3], b: [2, 3, 4] }

        assert.deepEqual(await json("$arrayUnion[a;b]", env), [1, 2, 3, 4])
        assert.deepEqual(await json("$arrayIntersect[a;b]", env), [2, 3])
        assert.deepEqual(await json("$arrayDiff[a;b]", env), [1])
    })
})

describe("$arrayLoad", () => {
    it("stores numbers and booleans as such, and the rest as text", async () => {
        const env: Record<string, unknown> = {}
        await output(`$arrayLoad[a;,;5,-2,0.5,true,false,123456789012345678,007,1.50,1e3,null,"7",word]`, env)

        assert.deepEqual(env.a, [
            5,
            -2,
            0.5,
            true,
            false,
            "123456789012345678",
            "007",
            "1.50",
            "1e3",
            "null",
            "7",
            "word",
        ])
    })

    it("joins back into the text it split, quotes aside", async () => {
        const text = 'I paid 1.50 for 1e3 items, -0 left, null and {"a":1} true 42'
        assert.equal(await output(`$arrayLoad[w; ;${text}]$arrayJoin[w; ]`), text)
    })

    it("is found again by a lookup of the same type", async () => {
        assert.equal(
            await output(`$arrayLoad[ids;,;5,10]$arrayIncludes[ids;10] $arrayIndexOf[ids;10] $arrayIncludes[ids;"10"]`),
            "true 1 false"
        )
    })

    it("splits the way ForgeScript's own did", async () => {
        const env: Record<string, unknown> = {}
        await output("$arrayLoad[none]$arrayLoad[chars;;abc]$arrayLoad[semi;|;x;y|z]", env)

        assert.deepEqual(env.none, [], "no separator, no elements")
        assert.deepEqual(env.chars, ["a", "b", "c"])
        assert.deepEqual(env.semi, ["x;y", "z"], "the arguments are joined on ; before splitting")
    })
})

describe("$arrayPushAt", () => {
    it("adds to an array inside a variable, creating it when missing", async () => {
        const env: Record<string, unknown> = {}
        await output(String.raw`$arrayPushAt[inv;items;sword]$arrayPushAt[inv;items;{"name":"shield"}]`, env)

        assert.deepEqual(env.inv, { items: ["sword", { name: "shield" }] })
    })

    it("refuses what isn't an array", async () => {
        assert.match(await failure("$arrayPushAt[d;x;1]", { d: { x: {} } }), /"d;x" is an object, not an array/)
    })
})
