"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonSize",
    version: "1.0.0",
    description: "Returns the size of a JSON value",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The variable, or JSON"), forgescript_1.Arg.restString("keys", "The keys to follow")],
    output: forgescript_1.ArgType.Number,
    execute(ctx, [source, keys]) {
        const at = new Location_1.Location(ctx, source, keys);
        const read = at.read();
        if (!read.ok)
            return this.customError(read.reason);
        const value = read.value;
        if (value === undefined || value === null)
            return this.success(0);
        if (Array.isArray(value) || typeof value === "string")
            return this.success(value.length);
        if ((0, location_1.isRecord)(value))
            return this.success(Object.keys(value).length);
        return this.customError(`"${at}" is ${(0, value_1.describe)(value)}, it has no size.`);
    },
});
//# sourceMappingURL=jsonSize.js.map