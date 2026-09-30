"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
(0, node_test_1.describe)("$objectMerge and $objectDefaults", () => {
    (0, node_test_1.it)("merge level by level, arrays replaced", async () => {
        const env = { cfg: { a: { x: 1, y: 1 }, tags: [1, 2] } };
        await (0, harness_1.output)(String.raw `$objectMerge[cfg;{"a":{"y":2,"z":3},"tags":[9\]}]`, env);
        strict_1.default.deepEqual(env.cfg, { a: { x: 1, y: 2, z: 3 }, tags: [9] });
    });
    (0, node_test_1.it)("merge from a variable under keys, as a copy", async () => {
        const env = { base: { lang: "en" } };
        await (0, harness_1.output)("$objectMerge[user;settings;base]", env);
        strict_1.default.deepEqual(env.user, { settings: { lang: "en" } });
        strict_1.default.notEqual(env.user.settings, env.base);
    });
    (0, node_test_1.it)("leave no target behind when the source is bad", async () => {
        const env = {};
        strict_1.default.match(await (0, harness_1.failure)("$objectMerge[cfg;{bad}]", env), /not valid JSON/);
        strict_1.default.equal(env.cfg, undefined);
    });
    (0, node_test_1.it)("merge several objects in order, the later ones winning", async () => {
        const env = { extra: { c: 3 } };
        await (0, harness_1.output)(`$objectMerge[cfg;{"a":1,"b":1};{"b":2};extra]`, env);
        strict_1.default.deepEqual(env.cfg, { a: 1, b: 2, c: 3 });
    });
    (0, node_test_1.it)("merge several objects under keys, a variable before the last read through $env", async () => {
        const env = { base: { lang: "en" }, extra: { dm: true } };
        await (0, harness_1.output)(`$objectMerge[user;settings;$env[base];{"lang":"ru"};extra]`, env);
        strict_1.default.deepEqual(env.user, { settings: { lang: "ru", dm: true } });
    });
    (0, node_test_1.it)("take a broken object before the last for an object, not a key", async () => {
        const env = {};
        strict_1.default.match(await (0, harness_1.failure)(`$objectMerge[cfg;{a:1};{"b":2}]`, env), /not valid JSON/);
        strict_1.default.deepEqual(env, {});
    });
    (0, node_test_1.it)("fill in what is missing or null, keeping the rest", async () => {
        const env = { user: { coins: 50, xp: null, settings: { lang: "ru" } } };
        await (0, harness_1.output)(`$objectDefaults[user;{"coins":0,"xp":0,"level":1,"settings":{"lang":"en","dm":true}}]`, env);
        strict_1.default.deepEqual(env.user, { coins: 50, xp: 0, level: 1, settings: { lang: "ru", dm: true } });
    });
});
(0, node_test_1.describe)("$objectOf", () => {
    (0, node_test_1.it)("builds an object from pairs, typing the values", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$objectOf[name;Bob;xp;15;id;123456789012345678;vip;true]"), {
            name: "Bob",
            xp: 15,
            id: "123456789012345678",
            vip: true,
        });
    });
    (0, node_test_1.it)("nests with $arrayOf, with no ] to escape", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$objectOf[roles;$arrayOf[1;2];meta;$objectOf[a;b]]"), {
            roles: [1, 2],
            meta: { a: "b" },
        });
    });
    (0, node_test_1.it)("is empty without brackets, and refuses a key without a value", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$objectOf"), "{}");
        strict_1.default.match(await (0, harness_1.failure)("$objectOf[a;1;b]"), /"b" was left without one/);
    });
});
(0, node_test_1.describe)("$objectPick and $objectOmit", () => {
    const env = { user: { id: "1", name: "Bob", token: "secret" } };
    (0, node_test_1.it)("keep or leave out keys", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$objectPick[user;id;name;missing]", env), { id: "1", name: "Bob" });
        strict_1.default.deepEqual(await (0, harness_1.json)("$objectOmit[user;token]", env), { id: "1", name: "Bob" });
    });
});
//# sourceMappingURL=object.test.js.map