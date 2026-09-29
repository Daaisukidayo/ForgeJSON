"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayPush",
    version: "1.0.0",
    description: "Appends values to the end of an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the array"),
        forgescript_1.Arg.restString("values", "The values to append", true),
    ],
    execute(ctx, [variable, values]) {
        const list = new Location_1.Location(ctx, variable).array();
        if (!list.ok)
            return this.customError(list.reason);
        for (const value of values)
            list.value.push((0, value_1.parseValue)(value));
        return this.success();
    },
});
//# sourceMappingURL=arrayPush.js.map