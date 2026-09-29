"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
const polluted = () => ({});
(0, node_test_1.afterEach)(() => {
    delete Object.prototype.polluted;
});
(0, node_test_1.describe)("the prototype", () => {
    (0, node_test_1.it)("can't be reached through keys", async () => {
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
            const run = await harness_1.bot.run(code, { d: {} });
            strict_1.default.equal(run.errors.length, 1, `${code} went through`);
            strict_1.default.match(run.errors[0], /leads to the prototype/);
            strict_1.default.equal(polluted().polluted, undefined, `${code} polluted Object.prototype`);
        }
    });
    (0, node_test_1.it)("can't be reached with a key that came from a user", async () => {
        await harness_1.bot.run("$let[item;__proto__]$jsonSet[shop;$get[item];polluted;1]");
        strict_1.default.equal(polluted().polluted, undefined);
    });
    (0, node_test_1.it)("stays out of reach of parsed JSON that names it", async () => {
        const env = {};
        await (0, harness_1.output)(`$jsonLoad[evil;{"__proto__":{"polluted":"yes"},"a":{"__proto__":{"polluted":"yes"}}}]`, env);
        await (0, harness_1.output)("$objectMerge[target;evil]$objectDefaults[other;evil]$jsonSet[copy;$jsonGet[evil]]", env);
        strict_1.default.equal(polluted().polluted, undefined);
        strict_1.default.equal(Object.getPrototypeOf(env.target), Object.prototype, "the merge target kept its prototype");
        strict_1.default.deepEqual(env.target, { a: {} }, "the key was dropped, not followed");
    });
    (0, node_test_1.it)("stays out of reach of loosely written JSON that names it", async () => {
        const env = {};
        await (0, harness_1.output)("$jsonLoad[evil;$jsonStringify[{ __proto__: { polluted: 'yes' } }]]$objectMerge[target;evil]", env);
        strict_1.default.equal(polluted().polluted, undefined);
        strict_1.default.deepEqual(env.target, {}, "the key was dropped, not followed");
    });
    (0, node_test_1.it)("is not built into objects, nor used as a loop or result variable", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$objectOf[__proto__;1]"), /leads to the prototype/);
        strict_1.default.match(await (0, harness_1.failure)("$objectPick[d;__proto__]", { d: {} }), /leads to the prototype/);
        strict_1.default.match(await (0, harness_1.failure)("$arrayMap[list;__proto__;x]", { list: [1] }), /leads to the prototype/);
        strict_1.default.match(await (0, harness_1.failure)("$arraySlice[list;__proto__;0]", { list: [1] }), /leads to the prototype/);
    });
    (0, node_test_1.it)("stays a plain group name", async () => {
        const groups = await (0, harness_1.json)(String.raw `$arrayGroupBy[[{"k":"__proto__"},{"k":"toString"}\];k]`);
        strict_1.default.equal(Object.getPrototypeOf(groups), Object.prototype);
        strict_1.default.deepEqual(Object.keys(groups).sort(), ["__proto__", "toString"]);
        strict_1.default.equal(polluted().polluted, undefined);
    });
});
(0, node_test_1.describe)("an index from user input", () => {
    (0, node_test_1.it)("can't blow an array up", async () => {
        const env = { list: ["a"] };
        const started = Date.now();
        strict_1.default.match(await (0, harness_1.failure)("$jsonSet[list;5000000;x]", env), /past its end/);
        strict_1.default.deepEqual(env.list, ["a"]);
        strict_1.default.ok(Date.now() - started < 1000, "refusing it took as long as building it");
    });
});
(0, node_test_1.describe)("a Discord ID", () => {
    const id = "123456789012345678";
    (0, node_test_1.it)("stays exact through every way in", async () => {
        const env = {};
        await (0, harness_1.output)(`$jsonSet[a;${id}]$arrayPush[b;${id}]$jsonLoad[c;{"id":${id}}]$jsonLoad[d;$arrayOf[${id}]]$jsonLoad[e;$objectOf[id;${id}]]`, env);
        strict_1.default.deepEqual(env, { a: id, b: [id], c: { id }, d: [id], e: { id } });
    });
    (0, node_test_1.it)("is found again by every lookup", async () => {
        const env = { users: [{ id }, { id: "123456789012345679" }] };
        const found = await (0, harness_1.output)(`$arrayIncludes[$arrayPluck[users;id];${id}] $arrayFindIndex[users;u;$jsonGet[u;id]==${id}] $arrayCount[users;u;$jsonGet[u;id]==${id}]`, env);
        strict_1.default.equal(found, "true 0 1");
    });
});
//# sourceMappingURL=security.test.js.map