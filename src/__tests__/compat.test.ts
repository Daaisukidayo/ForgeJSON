import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { FunctionManager } from "@tryforge/forgescript"
import { json, output, TestBot } from "./support/harness"

const REPLACED = [
    "$jsonLoad",
    "$jsonSet",
    "$jsonHas",
    "$jsonDelete",
    "$jsonKeys",
    "$jsonValues",
    "$jsonStringify",
    "$arrayPush",
    "$arrayUnshift",
    "$arrayPop",
    "$arrayShift",
    "$arraySlice",
    "$arrayReverse",
    "$arrayJoin",
    "$arrayIncludes",
    "$arrayIndexOf",
    "$arrayShuffle",
    "$arrayUnique",
    "$arrayMap",
    "$arrayFilter",
    "$arrayFind",
    "$arrayFindIndex",
    "$arrayForEach",
    "$arrayLoad",
    "$arraySome",
    "$arrayEvery",
    "$arrayFindLast",
    "$arrayFindLastIndex",
    "$arrayReduce",
]

describe("ForgeScript's own functions", () => {
    it("are replaced by ForgeJSON's where the names match", () => {
        for (const name of REPLACED) {
            const path = FunctionManager.get(name)?.path ?? ""
            assert.ok(path && !path.includes("@tryforge"), `${name} is still ForgeScript's own`)
        }
    })

    it("are the only thing ForgeScript warns about when the extension loads", () => {
        assert.deepEqual(new TestBot().warnings, [])
    })
})

describe("a call written for ForgeScript's own functions", () => {
    it("loads, sets, checks and deletes as before", async () => {
        const env: Record<string, unknown> = {}
        const said = await output(`$jsonLoad[d;{"a":1}]$jsonSet[d;b;2]$jsonHas[d;a]$jsonDelete[d;a]$jsonHas[d;a]`, env)

        assert.equal(said, "truetruetruefalse")
        assert.deepEqual(env.d, { b: 2 })
    })

    it("writes what $env reads", async () => {
        assert.equal(await output("$jsonSet[d;list;$arrayOf[1;2]]$env[d;list;1]"), "true2")
    })

    it("lists keys and joins values of a variable", async () => {
        const env = { d: { a: 1, b: "x" } }

        assert.deepEqual(await json("$jsonKeys[d]", env), ["a", "b"])
        assert.equal(await output("$jsonValues[d]|$jsonValues[d;-]", env), "1, x|1-x")
        assert.equal(await output("$jsonStringify[d]", env), '{"a":1,"b":"x"}')
    })

    it("pushes, shifts and pops on an array $arrayLoad made", async () => {
        assert.equal(
            await output(
                "$arrayLoad[a;,;x,y]$arrayPush[a;z]$arrayUnshift[a;w]$arrayShift[a]$arrayPop[a]$arrayJoin[a;-]"
            ),
            "wzx-y"
        )
    })

    it("finds the numbers $arrayLoad now stores as numbers", async () => {
        assert.equal(
            await output(`$arrayLoad[a;,;1,2,3]$arrayIncludes[a;2] $arrayIndexOf[a;3] $arrayIncludes[a;"2"]`),
            "true 2 false"
        )
    })

    it("loads results to another variable", async () => {
        const env: Record<string, unknown> = {}
        await output("$arrayLoad[a;,;3,1,3]$arraySlice[a;first;0;1]$arrayUnique[a;once]$arrayReverse[a;backwards]", env)

        assert.deepEqual(env.first, [3])
        assert.deepEqual(env.once, [3, 1])
        assert.deepEqual(env.backwards, [3, 1, 3])
    })

    it("maps with $return and $env, into another variable", async () => {
        const env: Record<string, unknown> = {}
        await output("$arrayLoad[a;,;1,2,3]$arrayMap[a;x;$return[$multi[$env[x];2]];doubled]", env)

        assert.deepEqual(env.doubled, [2, 4, 6])
    })

    it("filters on a condition over $env, into another variable", async () => {
        const env: Record<string, unknown> = {}
        await output("$arrayLoad[a;,;1,2,3]$arrayFilter[a;x;$env[x]>1;big]", env)

        assert.deepEqual(env.big, [2, 3])
    })

    it("finds with a condition over $env", async () => {
        assert.equal(
            await output("$arrayLoad[a;,;1,2,3]$arrayFind[a;x;$env[x]>1] $arrayFindIndex[a;x;$env[x]==3]"),
            "2 2"
        )
    })

    it("loops with $letSum", async () => {
        assert.equal(await output("$arrayLoad[a;,;1,2,3]$let[s;0]$arrayForEach[a;x;$letSum[s;$env[x]]]$get[s]"), "6")
    })
})
