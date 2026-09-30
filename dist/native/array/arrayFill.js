"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const edit_1 = require("../../functions/edit");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayFill",
    version: "1.1.0",
    description: "Fills an array with a value",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the array"),
        forgescript_1.Arg.requiredString("value", "The value to fill the array with"),
    ],
    execute(ctx, [variable, text]) {
        const value = (0, value_1.readValue)(text);
        if (!value.ok)
            return this.customError(value.reason);
        const list = new Location_1.Location(ctx, variable).array({ create: false });
        if (!list.ok)
            return this.customError(list.reason);
        if (!list.value)
            return this.success();
        for (let i = 0; i < list.value.length; i++)
            list.value[i] = (0, edit_1.copy)(value.value);
        return this.success();
    },
});
//# sourceMappingURL=arrayFill.js.map