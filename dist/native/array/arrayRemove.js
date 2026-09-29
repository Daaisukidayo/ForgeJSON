"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayRemove",
    version: "1.0.0",
    description: "Removes every element equal to the given values",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the array"),
        forgescript_1.Arg.restString("values", "The values to remove", true),
    ],
    execute(ctx, [variable, values]) {
        const list = new Location_1.Location(ctx, variable).array();
        if (!list.ok)
            return this.customError(list.reason);
        const wanted = values.map(value_1.parseValue);
        const kept = list.value.filter((item) => !wanted.some((value) => (0, compare_1.isEqual)(item, value)));
        list.value.length = 0;
        for (const item of kept)
            list.value.push(item);
        return this.success();
    },
});
//# sourceMappingURL=arrayRemove.js.map