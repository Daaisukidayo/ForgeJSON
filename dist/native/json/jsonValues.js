"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonValues",
    version: "1.0.0",
    description: "Gets values from JSON",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The variable, or JSON"),
        forgescript_1.Arg.optionalString("separator", "The separator to use for every value"),
    ],
    output: forgescript_1.ArgType.String,
    execute(ctx, [source, separator]) {
        const read = new Location_1.Location(ctx, source).read();
        if (!read.ok)
            return this.customError(read.reason);
        const value = read.value;
        if (value !== undefined && value !== null && !(0, location_1.isContainer)(value)) {
            return this.customError(`${(0, source_1.label)(source)} is ${(0, value_1.describe)(value)}, it has no values.`);
        }
        const values = (0, location_1.isContainer)(value) ? Object.values(value) : [];
        return this.success(values.map((item) => (typeof item === "string" ? item : (0, value_1.stringify)(item))).join(separator ?? ", "));
    },
});
//# sourceMappingURL=jsonValues.js.map