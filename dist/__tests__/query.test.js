"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
const users = () => ({
    users: [
        { id: "111", name: "Ann", xp: 50, stats: { level: 2 } },
        { id: "222", name: "bob", xp: "500", stats: { level: 9 } },
        { id: "333", name: "Cid", stats: { level: 5 } },
        { id: "444", name: "Dee", xp: 120, stats: { level: 5 } },
    ],
});
const ids = (list) => list.map((user) => user.id);
(0, node_test_1.describe)("$arraySortBy", () => {
    (0, node_test_1.it)("sorts by a key, numbers stored as text included, missing ones last", async () => {
        strict_1.default.deepEqual(ids(await (0, harness_1.json)("$arraySortBy[users;desc;xp]", users())), ["222", "444", "111", "333"]);
        strict_1.default.deepEqual(ids(await (0, harness_1.json)("$arraySortBy[users;;xp]", users())), ["111", "444", "222", "333"]);
    });
    (0, node_test_1.it)("sorts by a key inside a key, keeping ties in their order", async () => {
        strict_1.default.deepEqual(ids(await (0, harness_1.json)("$arraySortBy[users;asc;stats;level]", users())), ["111", "333", "444", "222"]);
    });
    (0, node_test_1.it)("leaves the original as it was", async () => {
        const env = users();
        await (0, harness_1.output)("$arraySortBy[users;desc;xp]", env);
        strict_1.default.deepEqual(ids(env.users), ["111", "222", "333", "444"]);
    });
    (0, node_test_1.it)("orders IDs exactly, even ones a double can't tell apart", async () => {
        const env = { list: ["123456789012345679", "123456789012345678", "99"] };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arraySortBy[list]", env), ["99", "123456789012345678", "123456789012345679"]);
    });
    (0, node_test_1.it)("sorts text naturally and without caring for case", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$arraySortBy[["item10","Item2","item1"\]]`), [
            "item1",
            "Item2",
            "item10",
        ]);
        strict_1.default.deepEqual(ids(await (0, harness_1.json)("$arraySortBy[users;;name]", users())), ["111", "222", "333", "444"]);
    });
});
(0, node_test_1.describe)("a condition over every element", () => {
    (0, node_test_1.it)("compares numbers, however they are stored", async () => {
        strict_1.default.deepEqual(ids(await (0, harness_1.json)("$arrayFilter[users;u;$jsonGet[u;xp]>=100]", users())), ["222", "444"]);
        strict_1.default.deepEqual(ids(await (0, harness_1.json)("$arrayFilter[users;u;$jsonGet[u;stats;level]==5]", users())), ["333", "444"]);
    });
    (0, node_test_1.it)("takes any function that gives true or false", async () => {
        const env = {
            items: [
                { name: "Iron sword", tags: ["melee"] },
                { name: "Bow", tags: ["ranged"] },
            ],
        };
        strict_1.default.equal((await (0, harness_1.json)("$arrayFilter[items;i;$startsWith[$jsonGet[i;name];Iron]]", env)).length, 1);
        strict_1.default.equal((await (0, harness_1.json)("$arrayFind[items;i;$arrayIncludes[$jsonGet[i;tags];ranged]]", env)).name, "Bow");
        strict_1.default.equal((await (0, harness_1.json)("$arrayFind[items;i;$jsonGet[i;name]!=Bow]", env)).name, "Iron sword");
    });
    (0, node_test_1.it)("finds an element, where it is, and how many there are", async () => {
        strict_1.default.equal((await (0, harness_1.json)("$arrayFind[users;u;$jsonGet[u;id]==333]", users())).name, "Cid");
        strict_1.default.equal(await (0, harness_1.output)("$arrayFindIndex[users;u;$jsonGet[u;id]==333]", users()), "2");
        strict_1.default.equal(await (0, harness_1.output)("$arrayFind[users;u;$jsonGet[u;id]==999]|$arrayFindIndex[users;u;$jsonGet[u;id]==999]", users()), "|-1");
        strict_1.default.equal(await (0, harness_1.output)("$arrayCount[users;u;$jsonGet[u;stats;level]==5]", users()), "2");
    });
    (0, node_test_1.it)("gives a place on a leaderboard together with $arraySortBy", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayFindIndex[$arraySortBy[users;desc;xp];u;$jsonGet[u;id]==111]", users()), "2");
    });
});
(0, node_test_1.describe)("$arrayPluck and $arrayGroupBy", () => {
    (0, node_test_1.it)("pluck a key, a key inside a key too", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayPluck[users;xp]", users()), [50, "500", null, 120]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayPluck[users;stats;level]", users()), [2, 9, 5, 5]);
    });
    (0, node_test_1.it)("group by a key", async () => {
        const groups = await (0, harness_1.json)("$arrayGroupBy[users;name]", users());
        const levels = await (0, harness_1.json)("$arrayGroupBy[users;stats;level]", users());
        strict_1.default.deepEqual(Object.keys(groups), ["Ann", "bob", "Cid", "Dee"], "groups keep the order they were met in");
        strict_1.default.deepEqual(ids(levels[5]), ["333", "444"]);
        strict_1.default.deepEqual(Object.keys(levels), ["2", "5", "9"], "though numeric keys always sort, as in any JSON object");
    });
});
(0, node_test_1.describe)("$arraySum, $arrayAverage, $arrayMin and $arrayMax", () => {
    (0, node_test_1.it)("count numbers stored either way and skip the rest", async () => {
        const all = "$arraySum[users;xp] $arrayAverage[users;xp] $arrayMin[users;xp] $arrayMax[users;xp]";
        strict_1.default.equal(await (0, harness_1.output)(all, users()), "670 223.333333333333 50 500");
    });
    (0, node_test_1.it)("give 0 or nothing for an empty list, and add up without floating point noise", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arraySum[none]|$arrayAverage[none]|$arrayMin[none]|$arrayMax[none]"), "0|||");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arraySum[[0.1,0.2\]]`), "0.3");
    });
    (0, node_test_1.it)("count text only when it holds a number written in decimals", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arraySum[["0x10","0b11","5"," 7 ","1e1"\]]`), "22");
    });
});
(0, node_test_1.describe)("$arrayFormat", () => {
    const board = () => ({
        users: Array.from({ length: 12 }, (_, i) => ({ id: String(100 + i), xp: (i + 1) * 10, stats: { level: i } })),
    });
    (0, node_test_1.it)("writes a leaderboard in one call", async () => {
        const text = await (0, harness_1.output)("$arrayFormat[$arraySortBy[users;desc;xp];{#}. <@{id}> - {xp} XP;1;3]", board());
        strict_1.default.equal(text, "1. <@111> - 120 XP\n2. <@110> - 110 XP\n3. <@109> - 100 XP");
    });
    (0, node_test_1.it)("numbers the next page on from the last", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayFormat[users;{#}:{stats.level};2;5;, ]", board()), "6:5, 7:6, 8:7, 9:8, 10:9");
    });
    (0, node_test_1.it)("writes the element itself and leaves missing keys empty", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFormat[["a","b"\];[{.}\] {nope};;;|]`), "[a] |[b] ");
    });
    (0, node_test_1.it)("keeps doubled braces, and placeholders it can't read, as text", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFormat[[1\];{{{.}}}]`), "{1}");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFormat[[1\];{} {__proto__} {#]`), "{} {__proto__} {#");
    });
    (0, node_test_1.it)("refuses a page that can't be", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$arrayFormat[users;{id};0;5]", board()), /pages start at 1/);
    });
});
//# sourceMappingURL=query.test.js.map