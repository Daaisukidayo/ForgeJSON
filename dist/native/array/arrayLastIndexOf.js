"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayLastIndexOf",
    version: "1.1.0",
    description: "Gets the index of the last element equal to a value",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("value", "The value to look for"),
    ],
    output: forgescript_1.ArgType.Number,
    execute(ctx, [source, text]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const value = (0, value_1.parseValue)(text);
        let index = list.value.length - 1;
        while (index >= 0 && !(0, compare_1.isEqual)(list.value[index], value))
            index--;
        return this.success(index);
    },
});
//# sourceMappingURL=arrayLastIndexOf.js.map