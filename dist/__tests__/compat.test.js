"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const forgescript_1 = require("@tryforge/forgescript");
const harness_1 = require("./support/harness");
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
    "$arrayLastIndexOf",
    "$arrayPushJSON",
    "$arrayUnshiftJSON",
    "$arraySplice",
    "$arraySort",
    "$arrayFill",
    "$arrayRandomIndex",
    "$jsonEntries",
];
(0, node_test_1.describe)("ForgeScript's own functions", () => {
    (0, node_test_1.it)("are replaced by ForgeJSON's where the names match", () => {
        for (const name of REPLACED) {
            const path = forgescript_1.FunctionManager.get(name)?.path ?? "";
            strict_1.default.ok(path && !path.includes("@tryforge"), `${name} is still ForgeScript's own`);
        }
    });
    (0, node_test_1.it)("are the only thing ForgeScript warns about when the extension loads", () => {
        strict_1.default.deepEqual(new harness_1.TestBot().warnings, []);
    });
});
(0, node_test_1.describe)("a call written for ForgeScript's own functions", () => {
    (0, node_test_1.it)("loads, sets, checks and deletes as before", async () => {
        const env = {};
        const said = await (0, harness_1.output)(`$jsonLoad[d;{"a":1}]$jsonSet[d;b;2]$jsonHas[d;a]$jsonDelete[d;a]$jsonHas[d;a]`, env);
        strict_1.default.equal(said, "truetruetruefalse");
        strict_1.default.deepEqual(env.d, { b: 2 });
    });
    (0, node_test_1.it)("writes what $env reads", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonSet[d;list;$arrayOf[1;2]]$env[d;list;1]"), "true2");
    });
    (0, node_test_1.it)("lists keys and joins values of a variable", async () => {
        const env = { d: { a: 1, b: "x" } };
        strict_1.default.deepEqual(await (0, harness_1.json)("$jsonKeys[d]", env), ["a", "b"]);
        strict_1.default.equal(await (0, harness_1.output)("$jsonValues[d]|$jsonValues[d;-]", env), "1, x|1-x");
        strict_1.default.equal(await (0, harness_1.output)("$jsonStringify[d]", env), '{"a":1,"b":"x"}');
    });
    (0, node_test_1.it)("pushes, shifts and pops on an array $arrayLoad made", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayLoad[a;,;x,y]$arrayPush[a;z]$arrayUnshift[a;w]$arrayShift[a]$arrayPop[a]$arrayJoin[a;-]"), "wzx-y");
    });
    (0, node_test_1.it)("finds the numbers $arrayLoad now stores as numbers", async () => {
        strict_1.default.equal(await (0, harness_1.output)(`$arrayLoad[a;,;1,2,3]$arrayIncludes[a;2] $arrayIndexOf[a;3] $arrayIncludes[a;"2"]`), "true 2 false");
    });
    (0, node_test_1.it)("loads results to another variable", async () => {
        const env = {};
        await (0, harness_1.output)("$arrayLoad[a;,;3,1,3]$arraySlice[a;first;0;1]$arrayUnique[a;once]$arrayReverse[a;backwards]", env);
        strict_1.default.deepEqual(env.first, [3]);
        strict_1.default.deepEqual(env.once, [3, 1]);
        strict_1.default.deepEqual(env.backwards, [3, 1, 3]);
    });
    (0, node_test_1.it)("maps with $return and $env, into another variable", async () => {
        const env = {};
        await (0, harness_1.output)("$arrayLoad[a;,;1,2,3]$arrayMap[a;x;$return[$multi[$env[x];2]];doubled]", env);
        strict_1.default.deepEqual(env.doubled, [2, 4, 6]);
    });
    (0, node_test_1.it)("filters on a condition over $env, into another variable", async () => {
        const env = {};
        await (0, harness_1.output)("$arrayLoad[a;,;1,2,3]$arrayFilter[a;x;$env[x]>1;big]", env);
        strict_1.default.deepEqual(env.big, [2, 3]);
    });
    (0, node_test_1.it)("finds with a condition over $env", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayLoad[a;,;1,2,3]$arrayFind[a;x;$env[x]>1] $arrayFindIndex[a;x;$env[x]==3]"), "2 2");
    });
    (0, node_test_1.it)("pushes JSON, splices, sorts into another variable and finds the last match", async () => {
        const env = {};
        const said = await (0, harness_1.output)(`$arrayLoad[a;,;3,1,3]$arrayPushJSON[a;{"x":1}]$arraySplice[a;0;1]$arraySort[a;sorted;desc]$arrayLastIndexOf[a;3]`, env);
        strict_1.default.equal(said, "[3]1");
        strict_1.default.deepEqual(env.a, [1, 3, { x: 1 }]);
        strict_1.default.deepEqual(env.sorted, [{ x: 1 }, 3, 1]);
    });
    (0, node_test_1.it)("lists the entries of a variable", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$jsonEntries[o]", { o: { a: 1, b: 2 } }), '[["a",1],["b",2]]');
    });
    (0, node_test_1.it)("loops with $letSum", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayLoad[a;,;1,2,3]$let[s;0]$arrayForEach[a;x;$letSum[s;$env[x]]]$get[s]"), "6");
    });
});
//# sourceMappingURL=compat.test.js.map