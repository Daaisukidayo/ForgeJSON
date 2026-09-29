"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayDiff",
    version: "1.0.0",
    description: "Returns the elements of the first array missing from the second",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("first", "The array to keep elements from, as a variable or JSON"),
        forgescript_1.Arg.requiredString("second", "The array of elements to remove, as a variable or JSON"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [first, second]) {
        const kept = (0, source_1.readArray)(ctx, first);
        if (!kept.ok)
            return this.customError(kept.reason);
        const other = (0, source_1.readArray)(ctx, second);
        if (!other.ok)
            return this.customError(other.reason);
        const left = new Set(other.value.map(compare_1.canonical));
        return (0, source_1.answer)(this, kept.value.filter((item) => !left.has((0, compare_1.canonical)(item))));
    },
});
//# sourceMappingURL=arrayDiff.js.map