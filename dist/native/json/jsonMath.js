"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
const OPERATORS = {
    "*": (value, amount) => value * amount,
    "/": (value, amount) => value / amount,
    "%": (value, amount) => value % amount,
};
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonMath",
    version: "1.0.0",
    description: "Does math on a number in JSON",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the number"),
        forgescript_1.Arg.restString("keys;amount", "The keys to follow, then the amount", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, text] = (0, location_1.splitLast)(rest);
        const trimmed = text.trim();
        const sign = trimmed.charAt(0);
        const operate = Object.hasOwn(OPERATORS, sign) ? OPERATORS[sign] : null;
        const amount = (0, value_1.numberOf)(operate ? trimmed.slice(1) : trimmed);
        if (amount === undefined) {
            return this.customError(`"${text}" is not an amount. Write a number to add, or *, / or % and a number.`);
        }
        if (operate && sign !== "*" && amount === 0)
            return this.customError(`"${text}" divides by 0.`);
        const at = new Location_1.Location(ctx, variable, keys);
        const current = at.read();
        if (!current.ok)
            return this.customError(current.reason);
        const value = current.value;
        const base = value === undefined || value === null ? 0 : (0, value_1.numberOf)(value);
        if (base === undefined) {
            return this.customError(`"${at}" is ${(0, value_1.describe)(value)}, not a number.`);
        }
        const next = (0, value_1.tidy)(operate ? operate(base, amount) : base + amount);
        if (!Number.isFinite(next) || (Number.isInteger(next) && !Number.isSafeInteger(next))) {
            return this.customError(`"${at}" would become ${next}, too large to hold exactly.`);
        }
        const written = at.write(next);
        if (!written.ok)
            return this.customError(written.reason);
        return this.success();
    },
});
//# sourceMappingURL=jsonMath.js.map