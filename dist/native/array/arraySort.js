"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const arraySort_1 = require("@tryforge/forgescript/dist/native/array/arraySort");
const compare_1 = require("../../functions/compare");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arraySort",
    version: "1.1.0",
    description: "Sorts an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        forgescript_1.Arg.optionalEnum(arraySort_1.SortType, "sort type", "The sort type, asc or desc"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, other, order]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const sorted = (0, compare_1.sortBy)(list.value, [], order === arraySort_1.SortType.desc);
        if (other)
            return (0, source_1.store)(this, ctx, other, sorted);
        if ((0, value_1.looksLikeJSON)(source))
            return (0, source_1.answer)(this, sorted);
        list.value.length = 0;
        for (const item of sorted)
            list.value.push(item);
        return (0, source_1.answer)(this, list.value);
    },
});
//# sourceMappingURL=arraySort.js.map