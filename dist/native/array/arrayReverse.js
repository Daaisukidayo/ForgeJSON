"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayReverse",
    version: "1.0.0",
    description: "Reverses an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, other]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        if (other)
            return (0, source_1.store)(this, ctx, other, [...list.value].reverse());
        return (0, source_1.answer)(this, list.value.reverse());
    },
});
//# sourceMappingURL=arrayReverse.js.map