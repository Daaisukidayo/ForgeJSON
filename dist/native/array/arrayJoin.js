"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayJoin",
    version: "1.0.0",
    description: "Joins all elements of an array with a separator",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalString("separator", "The separator to use for every element"),
    ],
    output: forgescript_1.ArgType.String,
    execute(ctx, [source, separator]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return this.success((0, value_1.joinTexts)(list.value, separator ?? ", "));
    },
});
//# sourceMappingURL=arrayJoin.js.map