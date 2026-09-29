"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_KEYS = void 0;
exports.isContainer = isContainer;
exports.isRecord = isRecord;
exports.checkKeys = checkKeys;
exports.splitLast = splitLast;
exports.indexIn = indexIn;
exports.childOf = childOf;
exports.readIn = readIn;
exports.readVariable = readVariable;
exports.slotIn = slotIn;
const result_1 = require("./result");
exports.FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const INDEX = /^(?:0|[1-9]\d*)$/;
const FROM_END = /^-[1-9]\d*$/;
function isContainer(value) {
    return typeof value === "object" && value !== null;
}
function isRecord(value) {
    return isContainer(value) && !Array.isArray(value);
}
function checkKeys(keys) {
    const forbidden = keys.find((key) => exports.FORBIDDEN_KEYS.has(key));
    if (forbidden !== undefined)
        return (0, result_1.fail)(`"${forbidden}" can't be used as a key, it leads to the prototype.`);
    return (0, result_1.ok)(keys);
}
function splitLast(rest) {
    return [rest.slice(0, -1), rest[rest.length - 1]];
}
function indexIn(array, key) {
    if (INDEX.test(key))
        return Number(key);
    if (FROM_END.test(key))
        return array.length + Number(key);
    return -1;
}
function childOf(value, key) {
    if (Array.isArray(value)) {
        const index = indexIn(value, key);
        return index < 0 ? undefined : value[index];
    }
    if (isRecord(value) && Object.hasOwn(value, key))
        return value[key];
    return undefined;
}
function readIn(value, keys) {
    for (const key of keys) {
        value = childOf(value, key);
        if (value === undefined)
            return undefined;
    }
    return value;
}
function readVariable(ctx, name) {
    const value = ctx.getEnvironmentKey(name);
    return typeof value === "function" ? undefined : value;
}
function slotIn(array, key, at) {
    if (INDEX.test(key)) {
        if (Number(key) > array.length) {
            return (0, result_1.fail)(`"${at}" has ${array.length} element(s), index ${key} is past its end.`);
        }
        return (0, result_1.ok)(Number(key));
    }
    if (FROM_END.test(key)) {
        const index = array.length + Number(key);
        if (index < 0)
            return (0, result_1.fail)(`"${at}" has ${array.length} element(s), index ${key} is before its start.`);
        return (0, result_1.ok)(index);
    }
    return (0, result_1.fail)(`"${at}" is an array, and "${key}" is not an index.`);
}
//# sourceMappingURL=location.js.map