"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayFlat",
    version: "1.0.0",
    description: "Flattens the arrays nested in an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalNumber("depth", "The depth to flatten to"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, depth]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return (0, source_1.answer)(this, list.value.flat(typeof depth === "number" ? Math.max(depth, 0) : 1));
    },
});
//# sourceMappingURL=arrayFlat.js.map