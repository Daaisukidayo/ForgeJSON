"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonSet",
    version: "1.0.0",
    description: "Sets a JSON key to a value, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the JSON"),
        forgescript_1.Arg.restString("keys;value", "The keys to follow, then the value", true),
    ],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [variable, rest]) {
        const [keys, value] = (0, location_1.splitLast)(rest);
        const written = new Location_1.Location(ctx, variable, keys).write((0, value_1.parseValue)(value));
        if (!written.ok)
            return this.customError(written.reason);
        return this.success(true);
    },
});
//# sourceMappingURL=jsonSet.js.map