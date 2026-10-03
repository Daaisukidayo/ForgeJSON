import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { bot, failure, json, output } from "./support/harness"

describe("$jsonLoad", () => {
    it("loads JSON that $jsonGet reads key by key", async () => {
        assert.equal(await output(String.raw`$jsonLoad[d;{"user":{"tags":["a","b"\]}}]$jsonGet[d;user;tags;1]`), "b")
    })

    it("loads what $env or $jsonGet read from inside another variable", async () => {
        const env: Record<string, unknown> = { cache: { guild: { roles: ["1", "2"] } } }
        await output("$jsonLoad[a;$env[cache;guild]]$jsonLoad[b;$jsonGet[cache;guild;roles]]", env)

        assert.deepEqual(env.a, { roles: ["1", "2"] })
        assert.deepEqual(env.b, ["1", "2"])
    })

    it("takes two arguments, so a ; left in the JSON stops the code from compiling", async () => {
        await assert.rejects(bot.run(`$jsonLoad[d;{"a":"x;y"}]`), /expects 2 arguments at most/)
    })

    it("keeps unquoted long integers exact", async () => {
        const env: Record<string, unknown> = {}
        await output(`$jsonLoad[d;{"id":123456789012345678}]`, env)

        assert.deepEqual(env.d, { id: "123456789012345678" })
    })

    it("refuses JSON that doesn't parse instead of storing it as text", async () => {
        const env: Record<string, unknown> = {}

        assert.match(await failure("$jsonLoad[d;{a:1}]", env), /not valid JSON/)
        assert.equal(env.d, undefined, "nothing was stored")
    })

    it("names the escape when a ] cut the JSON short", async () => {
        assert.match(await failure(`$jsonLoad[d;{"a":[1,2]}]`), /put a backslash before it, two in a command file/)
    })

    it("loads a number, true, false, null or text that isn't an object or array", async () => {
        const env: Record<string, unknown> = {}
        await output(
            "$jsonLoad[a;5]$jsonLoad[b;true]$jsonLoad[c;null]$jsonLoad[d;Ann]$jsonLoad[e;123456789012345678]",
            env
        )

        assert.deepEqual([env.a, env.b, env.c, env.d, env.e], [5, true, null, "Ann", "123456789012345678"])
    })

    it("still loads empty text, the way a value never saved comes back from a database", async () => {
        const env: Record<string, unknown> = {}

        assert.equal(await output("$jsonLoad[d;]$jsonGet[d;anything]", env), "")
        assert.equal(env.d, "")
    })
})

describe("$jsonGet", () => {
    it("returns objects and arrays as compact JSON", async () => {
        assert.equal(await output("$jsonGet[d]", { d: { a: [1, 2], b: null } }), '{"a":[1,2],"b":null}')
    })

    it("returns nothing for null, so $default covers it", async () => {
        const env = { d: { gone: null, zero: 0 } }

        assert.equal(
            await output("$default[$jsonGet[d;gone];none]|$default[$jsonGet[d;missing];none]", env),
            "none|none"
        )
        assert.equal(await output("$jsonGet[d;zero]", env), "0", "0 is a value")
    })

    it("counts negative indices from the end", async () => {
        assert.equal(await output("$jsonGet[list;-1]", { list: [1, 2, 3] }), "3")
    })

    it("reads nothing past text, rather than the text", async () => {
        assert.equal(await output("$jsonGet[d;name;foo]", { d: { name: "abc" } }), "")
    })

    it("does not read a variable named after something on the prototype", async () => {
        assert.equal(await output("$jsonGet[toString]|$jsonGet[d;hasOwnProperty]", { d: {} }), "|")
    })

    it("reads inside JSON, such as what another function returned", async () => {
        const env = {
            users: [
                { name: "Ann", xp: 5 },
                { name: "Bob", xp: 50 },
            ],
        }

        assert.equal(await output(`$jsonGet[{"a":{"b":1}};a;b]`), "1")
        assert.equal(await output("$jsonGet[$arraySortBy[users;desc;xp];0;name]", env), "Bob")
    })
})

describe("$jsonSet", () => {
    it("creates missing levels as objects, never as arrays", async () => {
        const env: Record<string, unknown> = {}
        await output("$jsonSet[stats;123456789012345678;xp;5]$jsonSet[rewards;50;role;vip]", env)

        assert.deepEqual(env.stats, { "123456789012345678": { xp: 5 } })
        assert.deepEqual(env.rewards, { 50: { role: "vip" } }, "level 50 must not become 50 nulls")
    })

    it("keeps IDs and leading zeros exact", async () => {
        const env: Record<string, unknown> = {}
        await output("$jsonSet[d;id;123456789012345678]$jsonSet[d;code;007]$jsonSet[d;price;1.50]", env)

        assert.deepEqual(env.d, { id: "123456789012345678", code: "007", price: "1.50" })
    })

    it("reads numbers, booleans, null, JSON, and quoted text", async () => {
        const env: Record<string, unknown> = {}
        await output(
            String.raw`$jsonSet[d;n;42]$jsonSet[d;b;true]$jsonSet[d;z;null]$jsonSet[d;j;{"a":[1\]}]$jsonSet[d;q;"123"]`,
            env
        )

        assert.deepEqual(env.d, { n: 42, b: true, z: null, j: { a: [1] }, q: "123" })
    })

    it("sets a whole variable when no key is given", async () => {
        const env: Record<string, unknown> = {}
        await output("$jsonSet[x;5]", env)

        assert.equal(env.x, 5)
    })

    it("takes keys with dots whole", async () => {
        const env: Record<string, unknown> = {}
        await output("$jsonSet[inv;Sword v1.2;count;3]", env)

        assert.deepEqual(env.inv, { "Sword v1.2": { count: 3 } })
    })

    it("replaces and appends in an array, but never leaves a gap", async () => {
        const env: Record<string, unknown> = { list: [1, 2] }
        await output("$jsonSet[list;2;three]$jsonSet[list;-1;last]$jsonSet[list;0;first]", env)

        assert.deepEqual(env.list, ["first", 2, "last"])
        assert.match(await failure("$jsonSet[list;5;x]", env), /past its end/)
        assert.deepEqual(env.list, ["first", 2, "last"], "a refused index changes nothing")
    })

    it("refuses a key inside text, and JSON in place of a variable", async () => {
        assert.match(
            await failure("$jsonSet[d;name;first;x]", { d: { name: "abc" } }),
            /"d;name" is a string, it has no key "first"/
        )
        assert.match(await failure(`$jsonSet[{"a":1};a;2]`), /only a variable can be written to/)
    })

    it("returns true, as it always did", async () => {
        assert.equal(await output("$jsonSet[d;a;1]"), "true")
    })
})

describe("$jsonHas", () => {
    it("tells nothing from null", async () => {
        const env = { d: { gone: null, list: [1] } }

        assert.equal(
            await output("$jsonHas[d;gone] $jsonHas[d;missing] $jsonHas[d;list;0] $jsonHas[d]", env),
            "true false true true"
        )
    })
})

describe("$jsonDelete", () => {
    it("removes a key, an element, or a whole variable", async () => {
        const env: Record<string, unknown> = { d: { a: 1, b: 2 }, list: [1, 2, 3], gone: 1 }

        assert.equal(await output("$jsonDelete[d;a]$jsonDelete[list;0]$jsonDelete[gone]", env), "truetruetrue")
        assert.deepEqual(env.d, { b: 2 })
        assert.deepEqual(env.list, [2, 3], "the array closes the gap")
        assert.equal("gone" in env, false)
    })

    it("answers false when there was nothing to remove", async () => {
        assert.equal(
            await output("$jsonDelete[d;x]$jsonDelete[list;9]$jsonDelete[nothing]", { d: {}, list: [] }),
            "falsefalsefalse"
        )
    })

    it("removes a variable that holds undefined, still answering false", async () => {
        const env: Record<string, unknown> = { v: undefined }

        assert.equal(await output("$jsonDelete[v]", env), "false")
        assert.equal("v" in env, false)
    })
})

describe("$jsonType and $jsonSize", () => {
    const env = { d: { o: { a: 1 }, a: [1, 2, 3], s: "hello", n: 1, b: false, z: null } }

    it("name every kind of value", async () => {
        const types =
            "$jsonType[d;o] $jsonType[d;a] $jsonType[d;s] $jsonType[d;n] $jsonType[d;b] $jsonType[d;z] $jsonType[d;x]"
        assert.equal(await output(types, env), "object array string number boolean null undefined")
        assert.equal(await output(String.raw`$jsonType[[1,2\]]`), "array")
    })

    it("count elements, keys and characters", async () => {
        assert.equal(await output("$jsonSize[d;a] $jsonSize[d;o] $jsonSize[d;s] $jsonSize[d;none]", env), "3 1 5 0")
        assert.match(await failure("$jsonSize[d;n]", env), /has no size/)
    })
})

describe("$jsonEquals", () => {
    it("compares by content, whatever the key order", async () => {
        const env = { a: { x: 1, y: [1, { z: 2 }] } }

        assert.equal(await output(String.raw`$jsonEquals[a;{"y":[1,{"z":2}\],"x":1}]`, env), "true")
        assert.equal(await output(`$jsonEquals[a;{"x":2}]`, env), "false")
    })
})

describe("$jsonMath", () => {
    it("adds, starting from 0 and creating the levels on the way", async () => {
        const env: Record<string, unknown> = {}

        assert.equal(await output("$jsonMath[stats;123456789012345678;messages;1]", env), "", "it returns nothing")
        await output("$jsonMath[stats;123456789012345678;messages;10]", env)
        assert.deepEqual(env.stats, { "123456789012345678": { messages: 11 } })
    })

    it("takes away, counts on from text, and rounds away floating point noise", async () => {
        const env: Record<string, unknown> = { coins: 100, xp: "5", balance: 0.1 }
        await output("$jsonMath[coins;-30]$jsonMath[xp;1]$jsonMath[balance;0.2]", env)

        assert.deepEqual(env, { coins: 70, xp: 6, balance: 0.3 })
    })

    it("multiplies, divides and takes the remainder with a sign before the amount", async () => {
        const env: Record<string, unknown> = { coins: 100, hp: 7, turn: 5, price: 0.1, gems: 3 }
        await output(
            "$jsonMath[coins;*1.5]$jsonMath[hp;/2]$jsonMath[turn;%4]$jsonMath[price;*3]$jsonMath[gems;+2]",
            env
        )

        assert.deepEqual(env, { coins: 150, hp: 3.5, turn: 1, price: 0.3, gems: 5 })
    })

    it("refuses what isn't a number, on either side", async () => {
        assert.match(await failure("$jsonMath[name;1]", { name: "abc" }), /is a string, not a number/)
        assert.match(await failure("$jsonMath[n;abc]", { n: 1 }), /"abc" is not an amount/)
        assert.match(await failure("$jsonMath[n;*]", { n: 1 }), /"\*" is not an amount/)
    })

    it("refuses to divide by 0, and leaves the number as it was", async () => {
        const env: Record<string, unknown> = { n: 10 }

        assert.match(await failure("$jsonMath[n;/0]", env), /divides by 0/)
        assert.match(await failure("$jsonMath[n;%0]", env), /divides by 0/)
        assert.equal(env.n, 10)
    })

    it("refuses a result past what a number holds exactly, Infinity included", async () => {
        assert.match(await failure("$jsonMath[big;1]", { big: Number.MAX_SAFE_INTEGER }), /too large to hold exactly/)
        assert.match(await failure("$jsonMath[big;*10]", { big: 1e308 }), /would become Infinity/)
    })
})

describe("$jsonToggle", () => {
    it("flips a boolean, starting from true", async () => {
        const env: Record<string, unknown> = { flags: { quiet: "false" } }
        await output("$jsonToggle[flags;notify]$jsonToggle[flags;quiet]", env)

        assert.deepEqual(env.flags, { quiet: true, notify: true })
        await output("$jsonToggle[flags;notify]", env)
        assert.equal((env.flags as Record<string, unknown>).notify, false)
    })

    it("refuses what isn't a boolean", async () => {
        assert.match(await failure("$jsonToggle[n]", { n: 1 }), /not a boolean/)
    })
})

describe("$jsonKeys and $jsonValues", () => {
    const env = { d: { a: 1, b: { c: 2 }, n: null } }

    it("list keys as JSON, following keys like $env", async () => {
        assert.deepEqual(await json("$jsonKeys[d]", env), ["a", "b", "n"])
        assert.deepEqual(await json("$jsonKeys[d;b]", env), ["c"])
        assert.deepEqual(await json(String.raw`$jsonKeys[["x","y"\]]`), ["0", "1"])
        assert.deepEqual(await json("$jsonKeys[missing]"), [])
    })

    it("join values the way ForgeScript's own did, anything but text as JSON", async () => {
        assert.equal(await output("$jsonValues[d]", env), '1, {"c":2}, null')
        assert.equal(await output("$jsonValues[d;|]", env), '1|{"c":2}|null')
    })

    it("refuse what has no keys", async () => {
        assert.match(await failure("$jsonKeys[n]", { n: 1 }), /has no keys/)
    })
})

describe("$jsonEntries", () => {
    const env = { d: { a: 1, inv: { Sword: { count: 2 } } } }

    it("lists key and value pairs as JSON, following keys like $env", async () => {
        assert.deepEqual(await json("$jsonEntries[d;inv]", env), [["Sword", { count: 2 }]])
        assert.deepEqual(await json(String.raw`$jsonEntries[["x"\]]`), [["0", "x"]])
        assert.deepEqual(await json("$jsonEntries[missing]"), [])
    })

    it("hands $arrayFormat an inventory", async () => {
        assert.equal(await output("$arrayFormat[$jsonEntries[d;inv];{0} x{1.count}]", env), "Sword x2")
    })

    it("refuses what has no entries", async () => {
        assert.match(await failure("$jsonEntries[d;a]", env), /has no entries/)
    })
})

describe("$jsonStringify", () => {
    it("writes compact JSON, or laid out with spaces", async () => {
        const env = { d: { a: [1] } }

        assert.equal(await output("$jsonStringify[d]", env), '{"a":[1]}')
        assert.equal(await output("$jsonStringify[d;2]", env), '{\n  "a": [\n    1\n  ]\n}')
        assert.equal(await output(String.raw`$jsonStringify[[1, 2\]]`), "[1,2]")
        assert.equal(await output("$jsonStringify[missing]"), "")
    })

    it("turns JSON written the JavaScript way into JSON, ready for $jsonLoad", async () => {
        const env: Record<string, unknown> = {}
        await output(String.raw`$jsonLoad[user;$jsonStringify[{ name: 'Ann', tags: ['a', 'b',\], }]]`, env)

        assert.deepEqual(env.user, { name: "Ann", tags: ["a", "b"] })
        assert.equal(await output("$jsonStringify[{ age: 18 }]"), '{"age":18}')
        assert.equal(await output("$jsonStringify[{ age: 18 };2]"), '{\n  "age": 18\n}')
    })

    it("says what it couldn't read, and when a ] cut it short", async () => {
        assert.match(await failure("$jsonStringify[{ a: yes }]"), /not valid JSON: yes is not a value/)
        assert.match(await failure("$jsonStringify[{ tags: ['a'] }]"), /put a backslash before it/)
    })
})

describe("JSON written the JavaScript way", () => {
    it("is refused everywhere but $jsonStringify, with a pointer to it", async () => {
        const hint =
            /written the JavaScript way: put the keys and text in double quotes, or turn it into JSON with \$jsonStringify/

        assert.match(await failure("$jsonLoad[u;{ age: 18 }]"), hint)
        assert.match(await failure("$jsonGet[{ age: 18 };age]"), hint)
        assert.doesNotMatch(
            await failure("$jsonLoad[u;{ age: yes }]"),
            /JavaScript way/,
            "not when it isn't that either"
        )
    })
})
