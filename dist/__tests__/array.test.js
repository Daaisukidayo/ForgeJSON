"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
(0, node_test_1.describe)("$arrayOf", () => {
    (0, node_test_1.it)("builds an array, typing the values", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayOf[1;two;true;null;007]"), [1, "two", true, null, "007"]);
        strict_1.default.equal(await (0, harness_1.output)("$arrayOf"), "[]");
    });
});
(0, node_test_1.describe)("$arrayPush and $arrayUnshift", () => {
    (0, node_test_1.it)("create the array, keep the order, and return nothing", async () => {
        const env = {};
        strict_1.default.equal(await (0, harness_1.output)("$arrayPush[items;sword;shield]$arrayUnshift[items;helmet]", env), "");
        strict_1.default.deepEqual(env.items, ["helmet", "sword", "shield"]);
    });
    (0, node_test_1.it)("store numbers and booleans as such, IDs and JSON as they are", async () => {
        const env = {};
        await (0, harness_1.output)(String.raw `$arrayPush[list;5;true;123456789012345678;{"a":1};[1,2\]]`, env);
        strict_1.default.deepEqual(env.list, [5, true, "123456789012345678", { a: 1 }, [1, 2]]);
    });
    (0, node_test_1.it)("refuse what isn't an array", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$arrayPush[d;x]", { d: {} }), /is an object, not an array/);
    });
});
(0, node_test_1.describe)("$arrayPop and $arrayShift", () => {
    (0, node_test_1.it)("remove and return an element", async () => {
        const env = { queue: [{ id: 1 }, 2, 3] };
        strict_1.default.equal(await (0, harness_1.output)("$arrayShift[queue]|$arrayPop[queue]", env), '{"id":1}|3');
        strict_1.default.deepEqual(env.queue, [2]);
    });
    (0, node_test_1.it)("return nothing for a missing array, and refuse JSON", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayPop[none]$arrayShift[none]"), "");
        strict_1.default.match(await (0, harness_1.failure)(String.raw `$arrayPop[[1\]]`), /only a variable can be written to/);
    });
});
(0, node_test_1.describe)("$arrayRemove", () => {
    (0, node_test_1.it)("removes every match of the same type, in place", async () => {
        const list = ["5", 5, 6, { id: 1 }, "x", 5];
        strict_1.default.equal(await (0, harness_1.output)(`$arrayRemove[list;5;{"id":1}]`, { list }), "");
        strict_1.default.deepEqual(list, ["5", 6, "x"], "the text 5 is not the number 5");
        await (0, harness_1.output)(`$arrayRemove[list;"5"]`, { list });
        strict_1.default.deepEqual(list, [6, "x"]);
    });
});
(0, node_test_1.describe)("$arraySlice, $arrayReverse and $arrayJoin", () => {
    (0, node_test_1.it)("slice from either end, 0 as the end meaning the end", async () => {
        const env = { list: [1, 2, 3, 4] };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arraySlice[list;;1;3]", env), [2, 3]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arraySlice[list;;-2]", env), [3, 4]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arraySlice[list;;1;0]", env), [2, 3, 4]);
    });
    (0, node_test_1.it)("slice into another variable", async () => {
        const env = { list: [1, 2, 3] };
        strict_1.default.equal(await (0, harness_1.output)("$arraySlice[list;top;0;2]", env), "");
        strict_1.default.deepEqual(env.top, [1, 2]);
    });
    (0, node_test_1.it)("reverse a variable in place, and JSON into the output", async () => {
        const env = { list: [1, 2, 3] };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayReverse[list]", env), [3, 2, 1]);
        strict_1.default.deepEqual(env.list, [3, 2, 1]);
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$arrayReverse[["a","b"\]]`), ["b", "a"]);
    });
    (0, node_test_1.it)("leave the variable as it is when the reversed array goes to another one", async () => {
        const env = { list: [1, 2, 3] };
        strict_1.default.equal(await (0, harness_1.output)("$arrayReverse[list;back]$arrayPush[back;4]", env), "");
        strict_1.default.deepEqual(env.list, [1, 2, 3]);
        strict_1.default.deepEqual(env.back, [3, 2, 1, 4], "a copy of its own, not the same array");
    });
    (0, node_test_1.it)("join objects as JSON rather than [object Object]", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayJoin[[{"n":1},2,null\]]`), '{"n":1}, 2, ');
        strict_1.default.equal(await (0, harness_1.output)("$arrayJoin[list;]", { list: [1, 2] }), "12", "an empty separator joins without one");
    });
});
(0, node_test_1.describe)("$arrayIncludes and $arrayIndexOf", () => {
    (0, node_test_1.it)("tell a number from the same number as text", async () => {
        const env = { number: [5], text: ["5"] };
        strict_1.default.equal(await (0, harness_1.output)(`$arrayIncludes[number;5] $arrayIncludes[number;"5"]`, env), "true false");
        strict_1.default.equal(await (0, harness_1.output)(`$arrayIncludes[text;5] $arrayIncludes[text;"5"]`, env), "false true");
        strict_1.default.equal(await (0, harness_1.output)(`$arrayIndexOf[number;5] $arrayIndexOf[text;5] $arrayIndexOf[text;"5"]`, env), "0 -1 0");
    });
    (0, node_test_1.it)("tell true from the text true, and null from the text null", async () => {
        const env = { list: ["true", null] };
        strict_1.default.equal(await (0, harness_1.output)(`$arrayIndexOf[list;true] $arrayIndexOf[list;"true"] $arrayIndexOf[list;null]`, env), "-1 0 1");
    });
    (0, node_test_1.it)("find objects by what they hold, and IDs exactly", async () => {
        const env = { list: [{}, { a: 1, b: 2 }], ids: ["123456789012345678"] };
        strict_1.default.equal(await (0, harness_1.output)(`$arrayIndexOf[list;{"b":2,"a":1}]`, env), "1");
        strict_1.default.equal(await (0, harness_1.output)("$arrayIncludes[ids;123456789012345678] $arrayIncludes[ids;123456789012345679]", env), "true false");
    });
});
(0, node_test_1.describe)("$arrayRange", () => {
    (0, node_test_1.it)("counts from start to end, both included", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayRange[1;5]"), [1, 2, 3, 4, 5]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayRange[5;1]"), [5, 4, 3, 2, 1]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayRange[0;10;5]"), [0, 5, 10]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayRange[0;0.3;0.1]"), [0, 0.1, 0.2, 0.3], "without 0.30000000000000004");
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayRange[1;5;-1]"), [], "a step pointing away gives nothing");
    });
    (0, node_test_1.it)("refuses a step of 0, and builds a range of any length", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$arrayRange[1;5;0]"), /step of 0/);
        strict_1.default.equal((await (0, harness_1.json)("$arrayRange[1;100000]")).length, 100_000);
    });
});
(0, node_test_1.describe)("$arrayChunk, $arrayPage and $arrayPageCount", () => {
    const env = { list: [1, 2, 3, 4, 5] };
    (0, node_test_1.it)("split, page and count pages", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayChunk[list;2]", env), [[1, 2], [3, 4], [5]]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayPage[list;3;2]", env), [5]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayPage[list;9;2]", env), []);
        strict_1.default.equal(await (0, harness_1.output)("$arrayPageCount[list;2] $arrayPageCount[none;10]", env), "3 1");
    });
    (0, node_test_1.it)("refuse a page or a size that can't be", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$arrayPage[list;0;2]", env), /pages start at 1/);
        strict_1.default.match(await (0, harness_1.failure)("$arrayChunk[list;0]", env), /can't hold 0/);
    });
});
(0, node_test_1.describe)("$arraySample, $arrayShuffle and $arrayWeightedRandom", () => {
    (0, node_test_1.it)("pick different elements", async () => {
        const env = { list: [1, 2, 3, 4, 5] };
        const picked = await (0, harness_1.json)("$arraySample[list;3]", env);
        strict_1.default.equal(new Set(picked).size, 3, "no element twice");
        strict_1.default.ok(picked.every((n) => env.list.includes(n)));
        strict_1.default.ok(env.list.includes(Number(await (0, harness_1.output)("$arraySample[list]", env))));
    });
    (0, node_test_1.it)("shuffle a variable in place and JSON into the output, losing nothing", async () => {
        const list = [1, 2, 3, 4, 5];
        strict_1.default.equal(await (0, harness_1.output)("$arrayShuffle[list]", { list }), "", "in place, nothing returned");
        strict_1.default.deepEqual([...list].sort(), [1, 2, 3, 4, 5]);
        strict_1.default.deepEqual((await (0, harness_1.json)(String.raw `$arrayShuffle[[1,2,3\]]`)).sort(), [1, 2, 3]);
    });
    (0, node_test_1.it)("never pick an element weighing nothing", async () => {
        const env = { table: [{ item: "common", chance: 0 }, { item: "rare", chance: 1 }, { item: "junk" }] };
        for (let i = 0; i < 20; i++)
            strict_1.default.equal((await (0, harness_1.json)("$arrayWeightedRandom[table;chance]", env)).item, "rare");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayWeightedRandom[[{"chance":0}\];chance]`), "");
    });
    (0, node_test_1.it)("pick as often as the weights say", async () => {
        const env = {
            table: [
                { item: "a", chance: 1 },
                { item: "b", chance: 3 },
            ],
        };
        let b = 0;
        for (let i = 0; i < 2000; i++)
            if ((await (0, harness_1.json)("$arrayWeightedRandom[table;chance]", env)).item === "b")
                b++;
        strict_1.default.ok(b > 1300 && b < 1700, `b came up ${b} times in 2000`);
    });
});
(0, node_test_1.describe)("$arrayFlat, $arrayUnique and the set functions", () => {
    (0, node_test_1.it)("flatten to a depth", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$arrayFlat[[1,[2,[3\]\]\]]`), [1, 2, [3]]);
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$arrayFlat[[1,[2,[3\]\]\];Infinity]`), [1, 2, 3]);
    });
    (0, node_test_1.it)("drop repeats, whole or by a key, into another variable too", async () => {
        const env = {
            users: [{ id: 1, n: "a" }, { id: 1, n: "b" }, { id: 2 }],
            nums: [1, 1, "1", { a: 1 }, { a: 1 }],
        };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayUnique[users;;id]", env), [{ id: 1, n: "a" }, { id: 2 }]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayUnique[nums]", env), [1, "1", { a: 1 }], "1 and '1' are different values here");
        await (0, harness_1.output)("$arrayUnique[nums;once]", env);
        strict_1.default.deepEqual(env.once, [1, "1", { a: 1 }]);
    });
    (0, node_test_1.it)("combine sets", async () => {
        const env = { a: [1, 2, 2, 3], b: [2, 3, 4] };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayUnion[a;b]", env), [1, 2, 3, 4]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayIntersect[a;b]", env), [2, 3]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayDiff[a;b]", env), [1]);
    });
});
(0, node_test_1.describe)("$arrayLoad", () => {
    (0, node_test_1.it)("stores numbers and booleans as such, and the rest as text", async () => {
        const env = {};
        await (0, harness_1.output)(`$arrayLoad[a;,;5,-2,0.5,true,false,123456789012345678,007,1.50,1e3,null,"7",word]`, env);
        strict_1.default.deepEqual(env.a, [
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
        ]);
    });
    (0, node_test_1.it)("joins back into the text it split, quotes aside", async () => {
        const text = 'I paid 1.50 for 1e3 items, -0 left, null and {"a":1} true 42';
        strict_1.default.equal(await (0, harness_1.output)(`$arrayLoad[w; ;${text}]$arrayJoin[w; ]`), text);
    });
    (0, node_test_1.it)("is found again by a lookup of the same type", async () => {
        strict_1.default.equal(await (0, harness_1.output)(`$arrayLoad[ids;,;5,10]$arrayIncludes[ids;10] $arrayIndexOf[ids;10] $arrayIncludes[ids;"10"]`), "true 1 false");
    });
    (0, node_test_1.it)("splits the way ForgeScript's own did", async () => {
        const env = {};
        await (0, harness_1.output)("$arrayLoad[none]$arrayLoad[chars;;abc]$arrayLoad[semi;|;x;y|z]", env);
        strict_1.default.deepEqual(env.none, [], "no separator, no elements");
        strict_1.default.deepEqual(env.chars, ["a", "b", "c"]);
        strict_1.default.deepEqual(env.semi, ["x;y", "z"], "the arguments are joined on ; before splitting");
    });
});
(0, node_test_1.describe)("$arrayPushAt", () => {
    (0, node_test_1.it)("adds to an array inside a variable, creating it when missing", async () => {
        const env = {};
        await (0, harness_1.output)(String.raw `$arrayPushAt[inv;items;sword]$arrayPushAt[inv;items;{"name":"shield"}]`, env);
        strict_1.default.deepEqual(env.inv, { items: ["sword", { name: "shield" }] });
    });
    (0, node_test_1.it)("refuses what isn't an array", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$arrayPushAt[d;x;1]", { d: { x: {} } }), /"d;x" is an object, not an array/);
    });
});
//# sourceMappingURL=array.test.js.map