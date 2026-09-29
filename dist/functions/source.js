"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readArray = readArray;
exports.readRecord = readRecord;
exports.label = label;
exports.answer = answer;
exports.store = store;
const Location_1 = require("../structures/Location");
const location_1 = require("./location");
const result_1 = require("./result");
const value_1 = require("./value");
function readArray(ctx, source) {
    const read = new Location_1.Location(ctx, source).read();
    if (!read.ok)
        return read;
    if (read.value === undefined || read.value === null)
        return (0, result_1.ok)([]);
    if (!Array.isArray(read.value))
        return (0, result_1.fail)(`${label(source)} is ${(0, value_1.describe)(read.value)}, not an array.`);
    return (0, result_1.ok)(read.value);
}
function readRecord(ctx, source) {
    const read = new Location_1.Location(ctx, source).read();
    if (!read.ok)
        return read;
    if (read.value === undefined || read.value === null)
        return (0, result_1.ok)({});
    if (!(0, location_1.isRecord)(read.value))
        return (0, result_1.fail)(`${label(source)} is ${(0, value_1.describe)(read.value)}, not an object.`);
    return (0, result_1.ok)(read.value);
}
function label(source) {
    return (0, value_1.looksLikeJSON)(source) ? (0, value_1.preview)(source) : `"${source}"`;
}
function answer(fn, value) {
    return fn.success((0, value_1.toText)(value) ?? null);
}
function store(fn, ctx, variable, value) {
    if (!variable)
        return answer(fn, value);
    const name = (0, location_1.checkKeys)([variable]);
    if (!name.ok)
        return fn.customError(name.reason);
    ctx.setEnvironmentKey(variable, value);
    return fn.success();
}
//# sourceMappingURL=source.js.map