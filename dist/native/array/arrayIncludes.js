"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayIncludes",
    version: "1.0.0",
    description: "Checks whether a value exists in an array, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("value", "The value to look for"),
    ],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [source, text]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const value = (0, value_1.parseValue)(text);
        return this.success(list.value.some((item) => (0, compare_1.isEqual)(item, value)));
    },
});
//# sourceMappingURL=arrayIncludes.js.map