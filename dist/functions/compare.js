"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqual = isEqual;
exports.canonical = canonical;
exports.sortBy = sortBy;
exports.numbersIn = numbersIn;
const location_1 = require("./location");
const loose_1 = require("./loose");
const value_1 = require("./value");
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
function isEqual(a, b) {
    if (a === b)
        return true;
    if (!(0, location_1.isContainer)(a) || !(0, location_1.isContainer)(b) || Array.isArray(a) !== Array.isArray(b))
        return false;
    if (Array.isArray(a)) {
        const other = b;
        return a.length === other.length && a.every((item, i) => isEqual(item, other[i]));
    }
    const left = a;
    const right = b;
    const keys = Object.keys(left);
    return (keys.length === Object.keys(right).length &&
        keys.every((key) => Object.hasOwn(right, key) && isEqual(left[key], right[key])));
}
function canonical(value) {
    return (0, value_1.stringify)(sortKeys(value)) ?? "undefined";
}
function sortKeys(value) {
    if (Array.isArray(value))
        return value.map(sortKeys);
    if (!(0, location_1.isRecord)(value))
        return value;
    return Object.fromEntries(Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]));
}
function sortKey(value) {
    const num = (0, value_1.numberOf)(value);
    if (num !== undefined) {
        const text = String(value).trim();
        return { rank: 0, num, big: loose_1.INTEGER.test(text) ? BigInt(text) : null };
    }
    if (typeof value === "string")
        return { rank: 1, text: value };
    if (typeof value === "boolean")
        return { rank: 2, bool: value };
    return { rank: 3, text: canonical(value) };
}
function compareKeys(a, b) {
    if (a.rank !== b.rank)
        return a.rank - b.rank;
    if (a.rank === 0 && b.rank === 0) {
        if (a.big !== null && b.big !== null)
            return a.big < b.big ? -1 : a.big > b.big ? 1 : 0;
        return a.num - b.num;
    }
    if (a.rank === 2 && b.rank === 2)
        return Number(a.bool) - Number(b.bool);
    return collator.compare(a.text, b.text);
}
const isEmpty = (value) => value === undefined || value === null;
function sortBy(items, keys, descending) {
    const direction = descending ? -1 : 1;
    return items
        .map((item) => {
        const value = (0, location_1.readIn)(item, keys);
        return { item, empty: isEmpty(value), key: isEmpty(value) ? null : sortKey(value) };
    })
        .sort((a, b) => {
        if (a.empty || b.empty)
            return Number(a.empty) - Number(b.empty);
        return compareKeys(a.key, b.key) * direction;
    })
        .map(({ item }) => item);
}
function numbersIn(items, keys) {
    const out = [];
    for (const item of items) {
        const number = (0, value_1.numberOf)((0, location_1.readIn)(item, keys));
        if (number !== undefined)
            out.push(number);
    }
    return out;
}
//# sourceMappingURL=compare.js.map