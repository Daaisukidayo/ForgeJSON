"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = copy;
exports.mergeInto = mergeInto;
exports.defaultsInto = defaultsInto;
const location_1 = require("./location");
function copy(value) {
    if (Array.isArray(value))
        return value.map(copy);
    if (!(0, location_1.isRecord)(value))
        return value;
    const out = {};
    for (const key of Object.keys(value))
        if (!location_1.FORBIDDEN_KEYS.has(key))
            out[key] = copy(value[key]);
    return out;
}
function mergeInto(target, source) {
    for (const key of Object.keys(source)) {
        if (location_1.FORBIDDEN_KEYS.has(key))
            continue;
        const current = Object.hasOwn(target, key) ? target[key] : undefined;
        const incoming = source[key];
        if ((0, location_1.isRecord)(current) && (0, location_1.isRecord)(incoming))
            mergeInto(current, incoming);
        else
            target[key] = copy(incoming);
    }
}
function defaultsInto(target, source) {
    for (const key of Object.keys(source)) {
        if (location_1.FORBIDDEN_KEYS.has(key))
            continue;
        const current = Object.hasOwn(target, key) ? target[key] : undefined;
        const incoming = source[key];
        if (current === undefined || current === null)
            target[key] = copy(incoming);
        else if ((0, location_1.isRecord)(current) && (0, location_1.isRecord)(incoming))
            defaultsInto(current, incoming);
    }
}
//# sourceMappingURL=edit.js.map