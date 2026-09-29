"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayUnshift",
    version: "1.0.0",
    description: "Adds values to the start of an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the array"),
        forgescript_1.Arg.restString("values", "The values to add", true),
    ],
    execute(ctx, [variable, values]) {
        const list = new Location_1.Location(ctx, variable).array();
        if (!list.ok)
            return this.customError(list.reason);
        list.value.unshift(...values.map(value_1.parseValue));
        return this.success();
    },
});
//# sourceMappingURL=arrayUnshift.js.map