"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayPushAt",
    version: "1.0.0",
    description: "Appends a value to an array nested in JSON",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the array"),
        forgescript_1.Arg.restString("keys;value", "The keys to follow, then the value", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, value] = (0, location_1.splitLast)(rest);
        const list = new Location_1.Location(ctx, variable, keys).array();
        if (!list.ok)
            return this.customError(list.reason);
        list.value.push((0, value_1.parseValue)(value));
        return this.success();
    },
});
//# sourceMappingURL=arrayPushAt.js.map