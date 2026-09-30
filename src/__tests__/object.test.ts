import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { failure, json, output } from "./support/harness"

describe("$objectMerge and $objectDefaults", () => {
    it("merge level by level, arrays replaced", async () => {
        const env: Record<string, unknown> = { cfg: { a: { x: 1, y: 1 }, tags: [1, 2] } }
        await output(String.raw`$objectMerge[cfg;{"a":{"y":2,"z":3},"tags":[9\]}]`, env)

        assert.deepEqual(env.cfg, { a: { x: 1, y: 2, z: 3 }, tags: [9] })
    })

    it("merge from a variable under keys, as a copy", async () => {
        const env: Record<string, unknown> = { base: { lang: "en" } }
        await output("$objectMerge[user;settings;base]", env)

        assert.deepEqual(env.user, { settings: { lang: "en" } })
        assert.notEqual((env.user as { settings: unknown }).settings, env.base)
    })

    it("leave no target behind when the source is bad", async () => {
        const env: Record<string, unknown> = {}

        assert.match(await failure("$objectMerge[cfg;{bad}]", env), /not valid JSON/)
        assert.equal(env.cfg, undefined)
    })

    it("merge several objects in order, the later ones winning", async () => {
        const env: Record<string, unknown> = { extra: { c: 3 } }
        await output(`$objectMerge[cfg;{"a":1,"b":1};{"b":2};extra]`, env)

        assert.deepEqual(env.cfg, { a: 1, b: 2, c: 3 })
    })

    it("merge several objects under keys, a variable before the last read through $env", async () => {
        const env: Record<string, unknown> = { base: { lang: "en" }, extra: { dm: true } }
        await output(`$objectMerge[user;settings;$env[base];{"lang":"ru"};extra]`, env)

        assert.deepEqual(env.user, { settings: { lang: "ru", dm: true } })
    })

    it("take a broken object before the last for an object, not a key", async () => {
        const env: Record<string, unknown> = {}

        assert.match(await failure(`$objectMerge[cfg;{a:1};{"b":2}]`, env), /not valid JSON/)
        assert.deepEqual(env, {})
    })

    it("fill in what is missing or null, keeping the rest", async () => {
        const env: Record<string, unknown> = { user: { coins: 50, xp: null, settings: { lang: "ru" } } }
        await output(`$objectDefaults[user;{"coins":0,"xp":0,"level":1,"settings":{"lang":"en","dm":true}}]`, env)

        assert.deepEqual(env.user, { coins: 50, xp: 0, level: 1, settings: { lang: "ru", dm: true } })
    })
})

describe("$objectOf", () => {
    it("builds an object from pairs, typing the values", async () => {
        assert.deepEqual(await json("$objectOf[name;Bob;xp;15;id;123456789012345678;vip;true]"), {
            name: "Bob",
            xp: 15,
            id: "123456789012345678",
            vip: true,
        })
    })

    it("nests with $arrayOf, with no ] to escape", async () => {
        assert.deepEqual(await json("$objectOf[roles;$arrayOf[1;2];meta;$objectOf[a;b]]"), {
            roles: [1, 2],
            meta: { a: "b" },
        })
    })

    it("is empty without brackets, and refuses a key without a value", async () => {
        assert.equal(await output("$objectOf"), "{}")
        assert.match(await failure("$objectOf[a;1;b]"), /"b" was left without one/)
    })
})

describe("$objectPick and $objectOmit", () => {
    const env = { user: { id: "1", name: "Bob", token: "secret" } }

    it("keep or leave out keys", async () => {
        assert.deepEqual(await json("$objectPick[user;id;name;missing]", env), { id: "1", name: "Bob" })
        assert.deepEqual(await json("$objectOmit[user;token]", env), { id: "1", name: "Bob" })
    })
})
