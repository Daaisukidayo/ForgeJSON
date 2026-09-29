"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const random_1 = require("../../functions/random");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arraySample",
    version: "1.0.0",
    description: "Picks random elements from an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalNumber("count", "The number of elements to pick"),
    ],
    output: [forgescript_1.ArgType.Unknown, forgescript_1.ArgType.Json],
    execute(ctx, [source, count]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        if (typeof count !== "number")
            return (0, source_1.answer)(this, (0, random_1.shuffle)(list.value, 1)[0]);
        if (!Number.isInteger(count) || count < 0)
            return this.customError(`Can't pick ${count} elements.`);
        return (0, source_1.answer)(this, (0, random_1.shuffle)(list.value, count));
    },
});
//# sourceMappingURL=arraySample.js.map