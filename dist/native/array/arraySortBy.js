"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const arraySort_1 = require("@tryforge/forgescript/dist/native/array/arraySort");
const compare_1 = require("../../functions/compare");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arraySortBy",
    version: "1.0.0",
    description: "Sorts an array by a key",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalEnum(arraySort_1.SortType, "sort type", "The sort type, asc or desc"),
        forgescript_1.Arg.restString("key", "The key to sort by"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, order, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return (0, source_1.answer)(this, (0, compare_1.sortBy)(list.value, keys, order === arraySort_1.SortType.desc));
    },
});
//# sourceMappingURL=arraySortBy.js.map