import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import { bot, failure, json, output } from "./support/harness"

const polluted = () => ({}) as Record<string, unknown>

afterEach(() => {
    delete (Object.prototype as Record<string, unknown>).polluted
})

describe("the prototype", () => {
    it("can't be reached through keys", async () => {
        for (const code of [
            "$jsonSet[d;__proto__;polluted;yes]",
            "$jsonSet[__proto__;polluted;yes]",
            "$jsonSet[d;constructor;prototype;polluted;yes]",
            "$jsonMath[d;__proto__;polluted;1]",
            "$arrayPushAt[d;__proto__;polluted;yes]",
            "$objectMerge[d;__proto__;{}]",
            "$jsonLoad[__proto__;{}]",
            "$arrayPush[__proto__;yes]",
            "$jsonGet[d;__proto__;polluted]",
        ]) {
            const run = await bot.run(code, { d: {} })

            assert.equal(run.errors.length, 1, `${code} went through`)
            assert.match(run.errors[0], /leads to the prototype/)
            assert.equal(polluted().polluted, undefined, `${code} polluted Object.prototype`)
        }
    })

    it("can't be reached with a key that came from a user", async () => {
        await bot.run("$let[item;__proto__]$jsonSet[shop;$get[item];polluted;1]")
        assert.equal(polluted().polluted, undefined)
    })

    it("stays out of reach of parsed JSON that names it", async () => {
        const env: Record<string, unknown> = {}
        await output(`$jsonLoad[evil;{"__proto__":{"polluted":"yes"},"a":{"__proto__":{"polluted":"yes"}}}]`, env)
        await output("$objectMerge[target;evil]$objectDefaults[other;evil]$jsonSet[copy;$jsonGet[evil]]", env)

        assert.equal(polluted().polluted, undefined)
        assert.equal(Object.getPrototypeOf(env.target), Object.prototype, "the merge target kept its prototype")
        assert.deepEqual(env.target, { a: {} }, "the key was dropped, not followed")
    })

    it("stays out of reach of loosely written JSON that names it", async () => {
        const env: Record<string, unknown> = {}
        await output("$jsonLoad[evil;$jsonStringify[{ __proto__: { polluted: 'yes' } }]]$objectMerge[target;evil]", env)

        assert.equal(polluted().polluted, undefined)
        assert.deepEqual(env.target, {}, "the key was dropped, not followed")
    })

    it("is not built into objects, nor used as a loop or result variable", async () => {
        assert.match(await failure("$objectOf[__proto__;1]"), /leads to the prototype/)
        assert.match(await failure("$objectPick[d;__proto__]", { d: {} }), /leads to the prototype/)
        assert.match(await failure("$arrayMap[list;__proto__;x]", { list: [1] }), /leads to the prototype/)
        assert.match(await failure("$arraySlice[list;__proto__;0]", { list: [1] }), /leads to the prototype/)
    })

    it("stays a plain group name", async () => {
        const groups = await json(String.raw`$arrayGroupBy[[{"k":"__proto__"},{"k":"toString"}\];k]`)

        assert.equal(Object.getPrototypeOf(groups), Object.prototype)
        assert.deepEqual(Object.keys(groups).sort(), ["__proto__", "toString"])
        assert.equal(polluted().polluted, undefined)
    })
})

describe("an index from user input", () => {
    it("can't blow an array up", async () => {
        const env: Record<string, unknown> = { list: ["a"] }
        const started = Date.now()

        assert.match(await failure("$jsonSet[list;5000000;x]", env), /past its end/)
        assert.deepEqual(env.list, ["a"])
        assert.ok(Date.now() - started < 1000, "refusing it took as long as building it")
    })
})

describe("a Discord ID", () => {
    const id = "123456789012345678"

    it("stays exact through every way in", async () => {
        const env: Record<string, unknown> = {}

        await output(
            `$jsonSet[a;${id}]$arrayPush[b;${id}]$jsonLoad[c;{"id":${id}}]$jsonLoad[d;$arrayOf[${id}]]$jsonLoad[e;$objectOf[id;${id}]]`,
            env
        )

        assert.deepEqual(env, { a: id, b: [id], c: { id }, d: [id], e: { id } })
    })

    it("is found again by every lookup", async () => {
        const env = { users: [{ id }, { id: "123456789012345679" }] }
        const found = await output(
            `$arrayIncludes[$arrayPluck[users;id];${id}] $arrayFindIndex[users;u;$jsonGet[u;id]==${id}] $arrayCount[users;u;$jsonGet[u;id]==${id}]`,
            env
        )

        assert.equal(found, "true 0 1")
    })
})
