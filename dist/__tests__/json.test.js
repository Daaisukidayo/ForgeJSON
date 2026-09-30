"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
(0, node_test_1.describe)("$jsonLoad", () => {
    (0, node_test_1.it)("loads JSON that $jsonGet reads key by key", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$jsonLoad[d;{"user":{"tags":["a","b"\]}}]$jsonGet[d;user;tags;1]`), "b");
    });
    (0, node_test_1.it)("loads what $env or $jsonGet read from inside another variable", async () => {
        const env = { cache: { guild: { roles: ["1", "2"] } } };
        await (0, harness_1.output)("$jsonLoad[a;$env[cache;guild]]$jsonLoad[b;$jsonGet[cache;guild;roles]]", env);
        strict_1.default.deepEqual(env.a, { roles: ["1", "2"] });
        strict_1.default.deepEqual(env.b, ["1", "2"]);
    });
    (0, node_test_1.it)("takes two arguments, so a ; left in the JSON stops the code from compiling", async () => {
        await strict_1.default.rejects(harness_1.bot.run(`$jsonLoad[d;{"a":"x;y"}]`), /expects 2 arguments at most/);
    });
    (0, node_test_1.it)("keeps unquoted long integers exact", async () => {
        const env = {};
        await (0, harness_1.output)(`$jsonLoad[d;{"id":123456789012345678}]`, env);
        strict_1.default.deepEqual(env.d, { id: "123456789012345678" });
    });
    (0, node_test_1.it)("refuses JSON that doesn't parse instead of storing it as text", async () => {
        const env = {};
        strict_1.default.match(await (0, harness_1.failure)("$jsonLoad[d;{a:1}]", env), /not valid JSON/);
        strict_1.default.equal(env.d, undefined, "nothing was stored");
    });
    (0, node_test_1.it)("names the escape when a ] cut the JSON short", async () => {
        strict_1.default.match(await (0, harness_1.failure)(`$jsonLoad[d;{"a":[1,2]}]`), /put a backslash before it, two in a command file/);
    });
    (0, node_test_1.it)("loads a number, true, false, null or text that isn't an object or array", async () => {
        const env = {};
        await (0, harness_1.output)("$jsonLoad[a;5]$jsonLoad[b;true]$jsonLoad[c;null]$jsonLoad[d;Ann]$jsonLoad[e;123456789012345678]", env);
        strict_1.default.deepEqual([env.a, env.b, env.c, env.d, env.e], [5, true, null, "Ann", "123456789012345678"]);
    });
    (0, node_test_1.it)("still loads empty text, the way a value never saved comes back from a database", async () => {
        const env = {};
        strict_1.default.equal(await (0, harness_1.output)("$jsonLoad[d;]$jsonGet[d;anything]", env), "");
        strict_1.default.equal(env.d, "");
    });
});
(0, node_test_1.describe)("$jsonGet", () => {
    (0, node_test_1.it)("returns objects and arrays as compact JSON", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonGet[d]", { d: { a: [1, 2], b: null } }), '{"a":[1,2],"b":null}');
    });
    (0, node_test_1.it)("returns nothing for null, so $default covers it", async () => {
        const env = { d: { gone: null, zero: 0 } };
        strict_1.default.equal(await (0, harness_1.output)("$default[$jsonGet[d;gone];none]|$default[$jsonGet[d;missing];none]", env), "none|none");
        strict_1.default.equal(await (0, harness_1.output)("$jsonGet[d;zero]", env), "0", "0 is a value");
    });
    (0, node_test_1.it)("counts negative indices from the end", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonGet[list;-1]", { list: [1, 2, 3] }), "3");
    });
    (0, node_test_1.it)("reads nothing past text, rather than the text", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonGet[d;name;foo]", { d: { name: "abc" } }), "");
    });
    (0, node_test_1.it)("does not read a variable named after something on the prototype", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonGet[toString]|$jsonGet[d;hasOwnProperty]", { d: {} }), "|");
    });
    (0, node_test_1.it)("reads inside JSON, such as what another function returned", async () => {
        const env = {
            users: [
                { name: "Ann", xp: 5 },
                { name: "Bob", xp: 50 },
            ],
        };
        strict_1.default.equal(await (0, harness_1.output)(`$jsonGet[{"a":{"b":1}};a;b]`), "1");
        strict_1.default.equal(await (0, harness_1.output)("$jsonGet[$arraySortBy[users;desc;xp];0;name]", env), "Bob");
    });
});
(0, node_test_1.describe)("$jsonSet", () => {
    (0, node_test_1.it)("creates missing levels as objects, never as arrays", async () => {
        const env = {};
        await (0, harness_1.output)("$jsonSet[stats;123456789012345678;xp;5]$jsonSet[rewards;50;role;vip]", env);
        strict_1.default.deepEqual(env.stats, { "123456789012345678": { xp: 5 } });
        strict_1.default.deepEqual(env.rewards, { 50: { role: "vip" } }, "level 50 must not become 50 nulls");
    });
    (0, node_test_1.it)("keeps IDs and leading zeros exact", async () => {
        const env = {};
        await (0, harness_1.output)("$jsonSet[d;id;123456789012345678]$jsonSet[d;code;007]$jsonSet[d;price;1.50]", env);
        strict_1.default.deepEqual(env.d, { id: "123456789012345678", code: "007", price: "1.50" });
    });
    (0, node_test_1.it)("reads numbers, booleans, null, JSON, and quoted text", async () => {
        const env = {};
        await (0, harness_1.output)(String.raw `$jsonSet[d;n;42]$jsonSet[d;b;true]$jsonSet[d;z;null]$jsonSet[d;j;{"a":[1\]}]$jsonSet[d;q;"123"]`, env);
        strict_1.default.deepEqual(env.d, { n: 42, b: true, z: null, j: { a: [1] }, q: "123" });
    });
    (0, node_test_1.it)("sets a whole variable when no key is given", async () => {
        const env = {};
        await (0, harness_1.output)("$jsonSet[x;5]", env);
        strict_1.default.equal(env.x, 5);
    });
    (0, node_test_1.it)("takes keys with dots whole", async () => {
        const env = {};
        await (0, harness_1.output)("$jsonSet[inv;Sword v1.2;count;3]", env);
        strict_1.default.deepEqual(env.inv, { "Sword v1.2": { count: 3 } });
    });
    (0, node_test_1.it)("replaces and appends in an array, but never leaves a gap", async () => {
        const env = { list: [1, 2] };
        await (0, harness_1.output)("$jsonSet[list;2;three]$jsonSet[list;-1;last]$jsonSet[list;0;first]", env);
        strict_1.default.deepEqual(env.list, ["first", 2, "last"]);
        strict_1.default.match(await (0, harness_1.failure)("$jsonSet[list;5;x]", env), /past its end/);
        strict_1.default.deepEqual(env.list, ["first", 2, "last"], "a refused index changes nothing");
    });
    (0, node_test_1.it)("refuses a key inside text, and JSON in place of a variable", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonSet[d;name;first;x]", { d: { name: "abc" } }), /"d;name" is a string, it has no key "first"/);
        strict_1.default.match(await (0, harness_1.failure)(`$jsonSet[{"a":1};a;2]`), /only a variable can be written to/);
    });
    (0, node_test_1.it)("returns true, as it always did", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonSet[d;a;1]"), "true");
    });
});
(0, node_test_1.describe)("$jsonHas", () => {
    (0, node_test_1.it)("tells nothing from null", async () => {
        const env = { d: { gone: null, list: [1] } };
        strict_1.default.equal(await (0, harness_1.output)("$jsonHas[d;gone] $jsonHas[d;missing] $jsonHas[d;list;0] $jsonHas[d]", env), "true false true true");
    });
});
(0, node_test_1.describe)("$jsonDelete", () => {
    (0, node_test_1.it)("removes a key, an element, or a whole variable", async () => {
        const env = { d: { a: 1, b: 2 }, list: [1, 2, 3], gone: 1 };
        strict_1.default.equal(await (0, harness_1.output)("$jsonDelete[d;a]$jsonDelete[list;0]$jsonDelete[gone]", env), "truetruetrue");
        strict_1.default.deepEqual(env.d, { b: 2 });
        strict_1.default.deepEqual(env.list, [2, 3], "the array closes the gap");
        strict_1.default.equal("gone" in env, false);
    });
    (0, node_test_1.it)("answers false when there was nothing to remove", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonDelete[d;x]$jsonDelete[list;9]$jsonDelete[nothing]", { d: {}, list: [] }), "falsefalsefalse");
    });
});
(0, node_test_1.describe)("$jsonType and $jsonSize", () => {
    const env = { d: { o: { a: 1 }, a: [1, 2, 3], s: "hello", n: 1, b: false, z: null } };
    (0, node_test_1.it)("name every kind of value", async () => {
        const types = "$jsonType[d;o] $jsonType[d;a] $jsonType[d;s] $jsonType[d;n] $jsonType[d;b] $jsonType[d;z] $jsonType[d;x]";
        strict_1.default.equal(await (0, harness_1.output)(types, env), "object array string number boolean null undefined");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$jsonType[[1,2\]]`), "array");
    });
    (0, node_test_1.it)("count elements, keys and characters", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonSize[d;a] $jsonSize[d;o] $jsonSize[d;s] $jsonSize[d;none]", env), "3 1 5 0");
        strict_1.default.match(await (0, harness_1.failure)("$jsonSize[d;n]", env), /has no size/);
    });
});
(0, node_test_1.describe)("$jsonEquals", () => {
    (0, node_test_1.it)("compares by content, whatever the key order", async () => {
        const env = { a: { x: 1, y: [1, { z: 2 }] } };
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$jsonEquals[a;{"y":[1,{"z":2}\],"x":1}]`, env), "true");
        strict_1.default.equal(await (0, harness_1.output)(`$jsonEquals[a;{"x":2}]`, env), "false");
    });
});
(0, node_test_1.describe)("$jsonMath", () => {
    (0, node_test_1.it)("adds, starting from 0 and creating the levels on the way", async () => {
        const env = {};
        strict_1.default.equal(await (0, harness_1.output)("$jsonMath[stats;123456789012345678;messages;1]", env), "", "it returns nothing");
        await (0, harness_1.output)("$jsonMath[stats;123456789012345678;messages;10]", env);
        strict_1.default.deepEqual(env.stats, { "123456789012345678": { messages: 11 } });
    });
    (0, node_test_1.it)("takes away, counts on from text, and rounds away floating point noise", async () => {
        const env = { coins: 100, xp: "5", balance: 0.1 };
        await (0, harness_1.output)("$jsonMath[coins;-30]$jsonMath[xp;1]$jsonMath[balance;0.2]", env);
        strict_1.default.deepEqual(env, { coins: 70, xp: 6, balance: 0.3 });
    });
    (0, node_test_1.it)("multiplies, divides and takes the remainder with a sign before the amount", async () => {
        const env = { coins: 100, hp: 7, turn: 5, price: 0.1, gems: 3 };
        await (0, harness_1.output)("$jsonMath[coins;*1.5]$jsonMath[hp;/2]$jsonMath[turn;%4]$jsonMath[price;*3]$jsonMath[gems;+2]", env);
        strict_1.default.deepEqual(env, { coins: 150, hp: 3.5, turn: 1, price: 0.3, gems: 5 });
    });
    (0, node_test_1.it)("refuses what isn't a number, on either side", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[name;1]", { name: "abc" }), /is a string, not a number/);
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[n;abc]", { n: 1 }), /"abc" is not an amount/);
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[n;*]", { n: 1 }), /"\*" is not an amount/);
    });
    (0, node_test_1.it)("refuses to divide by 0, and leaves the number as it was", async () => {
        const env = { n: 10 };
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[n;/0]", env), /divides by 0/);
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[n;%0]", env), /divides by 0/);
        strict_1.default.equal(env.n, 10);
    });
    (0, node_test_1.it)("refuses a result past what a number holds exactly, Infinity included", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[big;1]", { big: Number.MAX_SAFE_INTEGER }), /too large to hold exactly/);
        strict_1.default.match(await (0, harness_1.failure)("$jsonMath[big;*10]", { big: 1e308 }), /would become Infinity/);
    });
});
(0, node_test_1.describe)("$jsonToggle", () => {
    (0, node_test_1.it)("flips a boolean, starting from true", async () => {
        const env = { flags: { quiet: "false" } };
        await (0, harness_1.output)("$jsonToggle[flags;notify]$jsonToggle[flags;quiet]", env);
        strict_1.default.deepEqual(env.flags, { quiet: true, notify: true });
        await (0, harness_1.output)("$jsonToggle[flags;notify]", env);
        strict_1.default.equal(env.flags.notify, false);
    });
    (0, node_test_1.it)("refuses what isn't a boolean", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonToggle[n]", { n: 1 }), /not a boolean/);
    });
});
(0, node_test_1.describe)("$jsonKeys and $jsonValues", () => {
    const env = { d: { a: 1, b: { c: 2 }, n: null } };
    (0, node_test_1.it)("list keys as JSON, following keys like $env", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$jsonKeys[d]", env), ["a", "b", "n"]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$jsonKeys[d;b]", env), ["c"]);
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$jsonKeys[["x","y"\]]`), ["0", "1"]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$jsonKeys[missing]"), []);
    });
    (0, node_test_1.it)("join values the way ForgeScript's own did, anything but text as JSON", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonValues[d]", env), '1, {"c":2}, null');
        strict_1.default.equal(await (0, harness_1.output)("$jsonValues[d;|]", env), '1|{"c":2}|null');
    });
    (0, node_test_1.it)("refuse what has no keys", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonKeys[n]", { n: 1 }), /has no keys/);
    });
});
(0, node_test_1.describe)("$jsonEntries", () => {
    const env = { d: { a: 1, inv: { Sword: { count: 2 } } } };
    (0, node_test_1.it)("lists key and value pairs as JSON, following keys like $env", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$jsonEntries[d;inv]", env), [["Sword", { count: 2 }]]);
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$jsonEntries[["x"\]]`), [["0", "x"]]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$jsonEntries[missing]"), []);
    });
    (0, node_test_1.it)("hands $arrayFormat an inventory", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayFormat[$jsonEntries[d;inv];{0} x{1.count}]", env), "Sword x2");
    });
    (0, node_test_1.it)("refuses what has no entries", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonEntries[d;a]", env), /has no entries/);
    });
});
(0, node_test_1.describe)("$jsonStringify", () => {
    (0, node_test_1.it)("writes compact JSON, or laid out with spaces", async () => {
        const env = { d: { a: [1] } };
        strict_1.default.equal(await (0, harness_1.output)("$jsonStringify[d]", env), '{"a":[1]}');
        strict_1.default.equal(await (0, harness_1.output)("$jsonStringify[d;2]", env), '{\n  "a": [\n    1\n  ]\n}');
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$jsonStringify[[1, 2\]]`), "[1,2]");
        strict_1.default.equal(await (0, harness_1.output)("$jsonStringify[missing]"), "");
    });
    (0, node_test_1.it)("turns JSON written the JavaScript way into JSON, ready for $jsonLoad", async () => {
        const env = {};
        await (0, harness_1.output)(String.raw `$jsonLoad[user;$jsonStringify[{ name: 'Ann', tags: ['a', 'b',\], }]]`, env);
        strict_1.default.deepEqual(env.user, { name: "Ann", tags: ["a", "b"] });
        strict_1.default.equal(await (0, harness_1.output)("$jsonStringify[{ age: 18 }]"), '{"age":18}');
        strict_1.default.equal(await (0, harness_1.output)("$jsonStringify[{ age: 18 };2]"), '{\n  "age": 18\n}');
    });
    (0, node_test_1.it)("says what it couldn't read, and when a ] cut it short", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$jsonStringify[{ a: yes }]"), /not valid JSON: yes is not a value/);
        strict_1.default.match(await (0, harness_1.failure)("$jsonStringify[{ tags: ['a'] }]"), /put a backslash before it/);
    });
});
(0, node_test_1.describe)("JSON written the JavaScript way", () => {
    (0, node_test_1.it)("is refused everywhere but $jsonStringify, with a pointer to it", async () => {
        const hint = /written the JavaScript way: put the keys and text in double quotes, or turn it into JSON with \$jsonStringify/;
        strict_1.default.match(await (0, harness_1.failure)("$jsonLoad[u;{ age: 18 }]"), hint);
        strict_1.default.match(await (0, harness_1.failure)("$jsonGet[{ age: 18 };age]"), hint);
        strict_1.default.doesNotMatch(await (0, harness_1.failure)("$jsonLoad[u;{ age: yes }]"), /JavaScript way/, "not when it isn't that either");
    });
});
//# sourceMappingURL=json.test.js.map