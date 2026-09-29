"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arraySum",
    version: "1.0.0",
    description: "Returns the sum of a key in the array",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"), forgescript_1.Arg.restString("key", "The key to sum")],
    output: forgescript_1.ArgType.Number,
    execute(ctx, [source, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return this.success((0, value_1.tidy)((0, compare_1.numbersIn)(list.value, keys).reduce((sum, number) => sum + number, 0)));
    },
});
//# sourceMappingURL=arraySum.js.map