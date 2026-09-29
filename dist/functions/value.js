"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.looksLikeJSON = looksLikeJSON;
exports.parseJSON = parseJSON;
exports.readJSON = readJSON;
exports.readLooseJSON = readLooseJSON;
exports.cutHint = cutHint;
exports.parseValue = parseValue;
exports.parseScalar = parseScalar;
exports.stringify = stringify;
exports.toText = toText;
exports.joinTexts = joinTexts;
exports.typeOf = typeOf;
exports.describe = describe;
exports.numberOf = numberOf;
exports.tidy = tidy;
exports.shorten = shorten;
exports.preview = preview;
const loose_1 = require("./loose");
const result_1 = require("./result");
const JSON_START = /^\s*[[{]/;
const LONG_DIGITS = /\d{16,}/;
const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
function looksLikeJSON(text) {
    return JSON_START.test(text);
}
function parseJSON(text) {
    try {
        return (0, result_1.ok)(LONG_DIGITS.test(text) ? JSON.parse(text, keepLongIntegers) : JSON.parse(text));
    }
    catch (err) {
        return (0, result_1.fail)(err instanceof Error ? err.message : String(err));
    }
}
function keepLongIntegers(_key, value, context) {
    if (typeof value === "number" && !Number.isSafeInteger(value) && context?.source && loose_1.INTEGER.test(context.source)) {
        return context.source;
    }
    return value;
}
function readJSON(text) {
    const parsed = parseJSON(text);
    if (parsed.ok)
        return parsed;
    const loose = (0, loose_1.parseLoose)(text).ok
        ? " It is written the JavaScript way: put the keys and text in double quotes, or turn it into JSON with $jsonStringify."
        : "";
    return (0, result_1.fail)(`${preview(text)} is not valid JSON: ${parsed.reason}.${cutHint(text)}${loose}`);
}
function readLooseJSON(text) {
    const parsed = parseJSON(text);
    if (parsed.ok)
        return parsed;
    const loose = (0, loose_1.parseLoose)(text);
    if (loose.ok)
        return loose;
    return (0, result_1.fail)(`${preview(text)} is not valid JSON: ${loose.reason}.${cutHint(text)}`);
}
function cutHint(text) {
    return count(text, "[") > count(text, "]")
        ? " A ] ends an argument early: put a backslash before it, two in a command file, or build the value with $arrayOf."
        : "";
}
function parseValue(text) {
    if (text === "null")
        return null;
    if (looksLikeJSON(text)) {
        const parsed = parseJSON(text);
        if (parsed.ok)
            return parsed.value;
    }
    return parseScalar(text);
}
function parseScalar(text) {
    if (text.length > 1 && text.startsWith('"') && text.endsWith('"')) {
        const parsed = parseJSON(text);
        return parsed.ok && typeof parsed.value === "string" ? parsed.value : text.slice(1, -1);
    }
    if (text === "true")
        return true;
    if (text === "false")
        return false;
    const number = Number(text);
    if (Number.isFinite(number) && String(number) === text)
        return number;
    return text;
}
function stringify(value, indent) {
    return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), indent);
}
function toText(value) {
    if (value === undefined)
        return undefined;
    if (typeof value === "string")
        return value;
    if (typeof value === "object")
        return stringify(value);
    return String(value);
}
function joinTexts(values, separator) {
    return values.map((value) => (value === null ? "" : (toText(value) ?? ""))).join(separator);
}
function typeOf(value) {
    if (value === null)
        return "null";
    if (Array.isArray(value))
        return "array";
    return typeof value;
}
function describe(value) {
    const type = typeOf(value);
    if (type === "undefined")
        return "nothing";
    if (type === "null")
        return "null";
    return `${/^[aeiou]/.test(type) ? "an" : "a"} ${type}`;
}
function numberOf(value) {
    if (typeof value === "number")
        return Number.isFinite(value) ? value : undefined;
    if (typeof value !== "string")
        return undefined;
    const text = value.trim();
    if (!DECIMAL.test(text))
        return undefined;
    const number = Number(text);
    return Number.isFinite(number) ? number : undefined;
}
function tidy(value) {
    return Number.isInteger(value) ? value : Number.parseFloat(value.toPrecision(15));
}
function shorten(text) {
    return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}
function preview(text) {
    return `"${shorten(text)}"`;
}
function count(text, char) {
    return text.split(char).length - 1;
}
//# sourceMappingURL=value.js.map