"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayAverage",
    version: "1.0.0",
    description: "Returns the average value of a key in the array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.restString("key", "The key to average"),
    ],
    output: forgescript_1.ArgType.Number,
    execute(ctx, [source, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const numbers = (0, compare_1.numbersIn)(list.value, keys);
        if (!numbers.length)
            return this.success();
        return this.success((0, value_1.tidy)(numbers.reduce((sum, number) => sum + number, 0) / numbers.length));
    },
});
//# sourceMappingURL=arrayAverage.js.map