"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const location_1 = require("../functions/location");
const template_1 = require("../functions/template");
const loose_1 = require("../functions/loose");
const value_1 = require("../functions/value");
(0, node_test_1.describe)("a number stored as text", () => {
    (0, node_test_1.it)("counts only when written in decimals", () => {
        strict_1.default.equal((0, value_1.numberOf)(" 5 "), 5);
        strict_1.default.equal((0, value_1.numberOf)("1e3"), 1000);
        strict_1.default.equal((0, value_1.numberOf)("-.5"), -0.5);
        strict_1.default.equal((0, value_1.numberOf)("007"), 7);
        for (const text of ["0x10", "0b11", "0o7", "Infinity", "NaN", "", " ", "5 apples", "1e400"]) {
            strict_1.default.equal((0, value_1.numberOf)(text), undefined, text);
        }
    });
});
(0, node_test_1.describe)("a typed value", () => {
    (0, node_test_1.it)("becomes a number only when the number prints back as typed", () => {
        strict_1.default.equal((0, value_1.parseValue)("123"), 123);
        strict_1.default.equal((0, value_1.parseValue)("-5"), -5);
        strict_1.default.equal((0, value_1.parseValue)("0.1"), 0.1);
        for (const text of ["007", "1.50", "1e3", "-0", "0x10", " 5", "Infinity", "NaN", ""]) {
            strict_1.default.equal((0, value_1.parseValue)(text), text, `"${text}" would not come back the same as a number`);
        }
    });
    (0, node_test_1.it)("keeps an ID as text", () => {
        strict_1.default.equal((0, value_1.parseValue)("123456789012345678"), "123456789012345678");
        strict_1.default.equal((0, value_1.parseValue)("9007199254740993"), "9007199254740993", "one past the largest exact integer");
        strict_1.default.equal((0, value_1.parseValue)("9007199254740991"), 9007199254740991, "the largest exact integer is still a number");
    });
    (0, node_test_1.it)("reads booleans, null and JSON", () => {
        strict_1.default.equal((0, value_1.parseValue)("true"), true);
        strict_1.default.equal((0, value_1.parseValue)("false"), false);
        strict_1.default.equal((0, value_1.parseValue)("null"), null);
        strict_1.default.deepEqual((0, value_1.parseValue)('{"a":[1,2]}'), { a: [1, 2] });
    });
    (0, node_test_1.it)("leaves text that only looks like JSON as text", () => {
        strict_1.default.equal((0, value_1.parseValue)("[WIP] fix the shop"), "[WIP] fix the shop");
        strict_1.default.equal((0, value_1.parseValue)("{name}"), "{name}");
    });
    (0, node_test_1.it)("keeps quoted text as text, quotes removed", () => {
        strict_1.default.equal((0, value_1.parseValue)('"123"'), "123");
        strict_1.default.equal((0, value_1.parseValue)('"true"'), "true");
        strict_1.default.equal((0, value_1.parseValue)('"say \\"hi\\""'), 'say "hi"');
        strict_1.default.equal((0, value_1.parseValue)('"'), '"', "a lone quote is just text");
    });
});
(0, node_test_1.describe)("parsed JSON", () => {
    (0, node_test_1.it)("keeps an unquoted long integer as its digits", () => {
        const parsed = (0, value_1.parseJSON)('{"id":123456789012345678,"small":42,"big":1e21}');
        strict_1.default.equal(parsed.ok, true);
        strict_1.default.deepEqual(parsed.ok && parsed.value, { id: "123456789012345678", small: 42, big: 1e21 });
    });
    (0, node_test_1.it)("names the backslash, in words, when an argument was cut at a bracket", () => {
        const read = (0, value_1.readJSON)('{"a":[1,2');
        const reason = !read.ok ? read.reason : "";
        strict_1.default.equal(read.ok, false);
        strict_1.default.match(reason, /not valid JSON/);
        strict_1.default.match(reason, /put a backslash before it, two in a command file, or build the value with \$arrayOf/);
        strict_1.default.doesNotMatch(reason, /\\/, "ForgeError would double a backslash, and show a wrong escape");
    });
    (0, node_test_1.it)("does not blame the brackets when they are balanced", () => {
        const read = (0, value_1.readJSON)("{a:1}");
        strict_1.default.doesNotMatch(!read.ok ? read.reason : "", /backslash/);
    });
});
(0, node_test_1.describe)("loosely written JSON", () => {
    const value = (text) => {
        const parsed = (0, loose_1.parseLoose)(text);
        strict_1.default.ok(parsed.ok, `${text} did not read: ${!parsed.ok && parsed.reason}`);
        return parsed.value;
    };
    const reason = (text) => {
        const parsed = (0, loose_1.parseLoose)(text);
        strict_1.default.equal(parsed.ok, false, `${text} read, and should not have`);
        return !parsed.ok ? parsed.reason : "";
    };
    (0, node_test_1.it)("takes bare keys, single quotes and a comma at the end", () => {
        strict_1.default.deepEqual(value("{ age: 18, name: 'Ann', tags: ['a', 'b',], }"), {
            age: 18,
            name: "Ann",
            tags: ["a", "b"],
        });
    });
    (0, node_test_1.it)("reads strict JSON exactly as JSON.parse does", () => {
        for (const text of ['{"a":[1,2.5,-3e2,true,false,null],"b":"x\\ny\\u0041"}', "[]", '"text"', "0", " {} "]) {
            strict_1.default.deepEqual(value(text), JSON.parse(text), text);
        }
    });
    (0, node_test_1.it)("takes keys in any script and IDs as keys, and keeps long IDs exact", () => {
        strict_1.default.deepEqual(value("{ имя: 'Аня', 123456789012345678: { id: 876543210987654321 } }"), {
            имя: "Аня",
            "123456789012345678": { id: "876543210987654321" },
        });
    });
    (0, node_test_1.it)("keeps quotes of the other kind, and reads escapes in both", () => {
        strict_1.default.deepEqual(value(String.raw `{ a: 'say "hi"', b: "it's", c: 'it\'s', d: 'AB\n' }`), {
            a: 'say "hi"',
            b: "it's",
            c: "it's",
            d: "AB\n",
        });
    });
    (0, node_test_1.it)("keeps a key named __proto__ a plain key, as JSON.parse does", () => {
        const read = value("{ __proto__: { polluted: 1 } }");
        strict_1.default.equal(Object.getPrototypeOf(read), Object.prototype);
        strict_1.default.deepEqual(Object.keys(read), ["__proto__"]);
        strict_1.default.equal({}.polluted, undefined);
    });
    (0, node_test_1.it)("evaluates nothing, and names what it could not read", () => {
        strict_1.default.match(reason("{ a: process.exit() }"), /^process is not a value, text goes in quotes$/);
        strict_1.default.match(reason("{ a: yes }"), /yes is not a value/);
        strict_1.default.match(reason("{ a: undefined }"), /undefined is not a value/);
        strict_1.default.match(reason("{ my key: 1 }"), /expected : after a key, and a key with spaces goes in quotes at "key: 1 }"/);
        strict_1.default.match(reason("{ a: 1 b: 2 }"), /expected , or } at "b: 2 }"/);
        strict_1.default.match(reason("{ a: 'open }"), /the quotes are never closed at "'open }"/);
        strict_1.default.match(reason("[1,,2]"), /expected a value at ",2\]"/);
        strict_1.default.match(reason("{} x"), /there is more after the value at "x"/);
        strict_1.default.match(reason("{ a: 1"), /expected , or } at the end/);
        strict_1.default.match(reason(""), /expected a value at the end/);
    });
    (0, node_test_1.it)("keeps to JSON's numbers", () => {
        for (const text of ["+1", ".5", "Infinity", "NaN"])
            strict_1.default.ok(reason(text), text);
        strict_1.default.match(reason("0x10"), /there is more after the value/);
    });
    (0, node_test_1.it)("refuses a value nested too deep instead of crashing", () => {
        strict_1.default.equal(reason("[".repeat(100_000)), "it is nested too deep");
    });
});
(0, node_test_1.describe)("a key", () => {
    (0, node_test_1.it)("is refused when it leads to the prototype", () => {
        for (const key of ["__proto__", "prototype", "constructor"]) {
            strict_1.default.equal((0, location_1.checkKeys)(["a", key]).ok, false, `"${key}" was taken`);
        }
    });
    (0, node_test_1.it)("is taken as it is otherwise, dots and all", () => {
        strict_1.default.equal((0, location_1.checkKeys)(["Sword v1.2", "", "toString", "0"]).ok, true);
    });
});
(0, node_test_1.describe)("a template", () => {
    const render = (template, element, position = 1) => (0, template_1.fill)((0, template_1.parseTemplate)(template), element, position);
    (0, node_test_1.it)("reads keys with dots, the element and its place", () => {
        strict_1.default.equal(render("{#}. {name} {stats.xp} {.}", { name: "Ann", stats: { xp: 5 } }), '1. Ann 5 {"name":"Ann","stats":{"xp":5}}');
    });
    (0, node_test_1.it)("reads a key holding a dot when it is escaped", () => {
        strict_1.default.equal(render("{v1\\.2}", { "v1.2": "yes" }), "yes");
    });
    (0, node_test_1.it)("leaves missing keys and null empty", () => {
        strict_1.default.equal(render("[{a}][{b}]", { b: null }), "[][]");
    });
});
//# sourceMappingURL=parsing.test.js.map