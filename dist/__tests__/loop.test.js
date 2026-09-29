"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
const env = () => ({
    users: [
        { id: "123456789012345678", xp: 5 },
        { id: "2", xp: 50 },
        { id: "3", xp: 500 },
    ],
});
(0, node_test_1.describe)("$arrayMap", () => {
    (0, node_test_1.it)("collects what the code outputs, no $return needed", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayMap[users;u;$jsonGet[u;xp]]", env()), [5, 50, 500]);
    });
    (0, node_test_1.it)("collects what $return gives", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayMap[users;u;$return[$jsonGet[u;xp]]ignored]", env()), [5, 50, 500]);
    });
    (0, node_test_1.it)("still skips a run that returns nothing, so $if and $return filter as they always did", async () => {
        const code = "$arrayMap[users;u;$if[$jsonGet[u;xp]>10;$return[$jsonGet[u;xp]]]]";
        strict_1.default.deepEqual(await (0, harness_1.json)(code, env()), [50, 500]);
    });
    (0, node_test_1.it)("keeps IDs exact", async () => {
        const vars = { users: [{ id: "123456789012345678" }, { id: "876543210987654321" }] };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayMap[users;u;$jsonGet[u;id]]", vars), [
            "123456789012345678",
            "876543210987654321",
        ]);
    });
    (0, node_test_1.it)("reads what the code outputs the way $jsonSet reads a value", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayMap[users;u;$jsonGet[u;id]]", env()), ["123456789012345678", 2, 3]);
    });
    (0, node_test_1.it)("loads to another variable, and hands out the index last", async () => {
        const vars = env();
        strict_1.default.equal(await (0, harness_1.output)("$arrayMap[users;u;$objectOf[place;$jsonGet[i];xp;$jsonGet[u;xp]];out;i]", vars), "");
        strict_1.default.deepEqual(vars.out, [
            { place: 0, xp: 5 },
            { place: 1, xp: 50 },
            { place: 2, xp: 500 },
        ]);
    });
    (0, node_test_1.it)("gives the variables back as they were", async () => {
        const vars = { ...env(), u: "mine" };
        await (0, harness_1.output)("$arrayMap[users;u;x;;i]", vars);
        strict_1.default.equal(vars.u, "mine");
        strict_1.default.equal("i" in vars, false, "a variable that wasn't there is gone again");
    });
    (0, node_test_1.it)("nests under the same variable name, and reads JSON", async () => {
        const code = String.raw `$arrayMap[[[1,2\],[3\]\];row;$arraySum[$arrayMap[row;row;$jsonGet[row]]]]`;
        strict_1.default.deepEqual(await (0, harness_1.json)(code), [3, 3]);
    });
});
(0, node_test_1.describe)("$arrayFilter", () => {
    (0, node_test_1.it)("keeps the elements a condition holds for", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayPluck[$arrayFilter[users;u;$jsonGet[u;xp]>=50];id]", env()), ["2", "3"]);
    });
    (0, node_test_1.it)("reads a bare true or false too", async () => {
        const vars = { list: [{ on: true }, { on: false }] };
        strict_1.default.deepEqual(await (0, harness_1.json)("$arrayFilter[list;x;$jsonGet[x;on]]", vars), [{ on: true }]);
    });
    (0, node_test_1.it)("loads to another variable, and hands out the index last", async () => {
        const vars = { list: ["a", "b", "c", "d"] };
        await (0, harness_1.output)("$arrayFilter[list;x;$modulo[$jsonGet[i];2]==0;even;i]", vars);
        strict_1.default.deepEqual(vars.even, ["a", "c"]);
    });
});
(0, node_test_1.describe)("$arrayForEach", () => {
    (0, node_test_1.it)("changes the source through the variable", async () => {
        const vars = env();
        await (0, harness_1.output)("$arrayForEach[users;u;$jsonMath[u;xp;1]]", vars);
        strict_1.default.deepEqual(vars.users.map((user) => user.xp), [6, 51, 501]);
    });
    (0, node_test_1.it)("hands out the index", async () => {
        const vars = { ...env(), places: [] };
        await (0, harness_1.output)("$arrayForEach[users;u;$arrayPush[places;$jsonGet[i]];i]", vars);
        strict_1.default.deepEqual(vars.places, [0, 1, 2]);
    });
    (0, node_test_1.it)("passes an error on and still gives the variable back", async () => {
        const vars = { ...env(), u: "mine" };
        strict_1.default.match(await (0, harness_1.failure)("$arrayForEach[users;u;$jsonMath[u;id;x;1]]", vars), /has no key/);
        strict_1.default.equal(vars.u, "mine");
    });
});
(0, node_test_1.describe)("$arrayFind, $arrayFindIndex and $arrayCount", () => {
    (0, node_test_1.it)("read JSON as well as a variable", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFind[[3,8,12\];n;$jsonGet[n]>5]`), "8");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFindIndex[[3,8,12\];n;$jsonGet[n]>5]`), "1");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayCount[[3,8,12\];n;$jsonGet[n]>5]`), "2");
    });
    (0, node_test_1.it)("hand out the index", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayCount[["a","b","c"\];x;$jsonGet[i]>0;i]`), "2");
    });
});
(0, node_test_1.describe)("$arraySome, $arrayEvery, $arrayFindLast and $arrayFindLastIndex", () => {
    (0, node_test_1.it)("read JSON as well as a variable", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arraySome[[3,8,12\];n;$jsonGet[n]>10]`), "true");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayEvery[[3,8,12\];n;$jsonGet[n]>5]`), "false");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFindLast[[3,8,12\];n;$jsonGet[n]<10]`), "8");
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayFindLastIndex[[3,8,12\];n;$jsonGet[n]<10]`), "1");
    });
    (0, node_test_1.it)("read the condition the way $if does, $arrayEvery included", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayEvery[users;u;$jsonGet[u;xp]>0]", env()), "true");
        strict_1.default.equal(await (0, harness_1.output)("$arrayEvery[users;u;$checkCondition[$jsonGet[u;xp]>0]]", env()), "true");
    });
    (0, node_test_1.it)("answer an empty array the way JavaScript does", async () => {
        const empty = String.raw `[\]`;
        strict_1.default.equal(await (0, harness_1.output)(`$arraySome[${empty};n;true] $arrayEvery[${empty};n;false] $arrayFindLastIndex[${empty};n;true]`), "false true -1");
        strict_1.default.equal(await (0, harness_1.output)(`$arrayFindLast[${empty};n;true]`), "");
    });
    (0, node_test_1.it)("stop at the element that settles the answer, the last ones looking from the end", async () => {
        const vars = { ...env(), seen: [] };
        await (0, harness_1.output)("$arrayEvery[users;u;$arrayPush[seen;$jsonGet[u;xp]]$jsonGet[u;xp]<10]", vars);
        strict_1.default.deepEqual(vars.seen, [5, 50]);
        vars.seen = [];
        strict_1.default.equal(await (0, harness_1.output)("$arrayFindLastIndex[users;u;$arrayPush[seen;$jsonGet[u;xp]]$jsonGet[u;xp]<100]", vars), "1");
        strict_1.default.deepEqual(vars.seen, [500, 50]);
    });
    (0, node_test_1.it)("hand out the index", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arraySome[["a","b"\];x;$jsonGet[i]==1;i]`), "true");
    });
});
(0, node_test_1.describe)("$arrayReduce", () => {
    (0, node_test_1.it)("carries what the code outputs from one element to the next, starting from 0", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayReduce[users;sum;u;$math[$env[sum]+$jsonGet[u;xp]]]", env()), "555");
    });
    (0, node_test_1.it)("takes $return as ForgeScript's own does", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayReduce[users;sum;u;$return[$math[$env[sum]+$jsonGet[u;xp]]]ignored;5]", env()), "560");
    });
    (0, node_test_1.it)("starts from any value, and carries text, arrays and changes made through the variable", async () => {
        strict_1.default.equal(await (0, harness_1.output)(String.raw `$arrayReduce[["a","b","c"\];text;w;$env[text]$env[w];""]`), "abc");
        strict_1.default.deepEqual(await (0, harness_1.json)(String.raw `$arrayReduce[users;list;u;$arrayPush[list;$jsonGet[u;xp]];[\]]`, env()), [5, 50, 500]);
    });
    (0, node_test_1.it)("keeps the value as it was when the code outputs nothing", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$arrayReduce[users;most;u;$if[$jsonGet[u;xp]>$env[most];$return[$jsonGet[u;xp]]]]", env()), "500");
    });
});
(0, node_test_1.describe)("$break and $continue", () => {
    const loops = [
        "$arrayForEach[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]]",
        "$arrayMap[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]$jsonGet[u;xp]]",
        "$arrayFilter[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]true]",
        "$arrayFind[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayFindIndex[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayFindLast[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayFindLastIndex[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayCount[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]true]",
        "$arraySome[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]false]",
        "$arrayEvery[users;u;$if[$jsonGet[u;xp]==50;SIGNAL]true]",
        "$arrayReduce[users;sum;u;$if[$jsonGet[u;xp]==50;SIGNAL]1]",
    ];
    (0, node_test_1.it)("fail the command outside a loop, as in ForgeScript's own array functions", async () => {
        for (const loop of loops) {
            strict_1.default.match(await (0, harness_1.failure)(loop.replace("SIGNAL", "$break"), env()), /Break statements are not allowed/, loop);
            strict_1.default.match(await (0, harness_1.failure)(loop.replace("SIGNAL", "$continue"), env()), /Continue statements are not/, loop);
        }
    });
    (0, node_test_1.it)("go on to the loop around them, as they would out of a JavaScript forEach", async () => {
        const inner = "$arrayForEach[users;u;$arrayPush[log;$jsonGet[u;xp]]$if[$jsonGet[u;xp]==50;SIGNAL]]";
        const vars = { ...env(), log: [] };
        await (0, harness_1.output)(`$loop[2;${inner.replace("SIGNAL", "$break")}$arrayPush[log;after]]`, vars);
        strict_1.default.deepEqual(vars.log, [5, 50], "$break ended the $loop");
        vars.log = [];
        await (0, harness_1.output)(`$loop[2;${inner.replace("SIGNAL", "$continue")}$arrayPush[log;after]]`, vars);
        strict_1.default.deepEqual(vars.log, [5, 50, 5, 50], "$continue moved the $loop on");
    });
    (0, node_test_1.it)("leave no loop variable behind, and give back the ones there were", async () => {
        for (const loop of loops) {
            const vars = { ...env(), u: "mine" };
            await harness_1.bot.run(loop.replace("SIGNAL", "$break"), vars);
            strict_1.default.equal(vars.u, "mine", loop);
            strict_1.default.equal("sum" in vars, false, loop);
        }
    });
});
(0, node_test_1.describe)("an array that grows during the loop", () => {
    const grow = "$arrayPush[runs;1]$if[$arrayLength[items]<10;$arrayPush[items;1]]";
    const loops = [
        `$arrayForEach[items;x;${grow}]`,
        `$arrayMap[items;x;${grow}]`,
        `$arrayReduce[items;acc;x;${grow}]`,
        `$arrayFilter[items;x;${grow}true]`,
        `$arraySome[items;x;${grow}false]`,
        `$arrayEvery[items;x;${grow}true]`,
        `$arrayFindLast[items;x;${grow}false]`,
    ];
    (0, node_test_1.it)("is gone over only as far as it reached when the loop started, as in ForgeScript's own", async () => {
        for (const loop of loops) {
            const vars = { items: [0], runs: [] };
            await (0, harness_1.output)(loop, vars);
            strict_1.default.equal(vars.runs.length, 1, loop);
        }
    });
});
//# sourceMappingURL=loop.test.js.map