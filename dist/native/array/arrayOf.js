"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayOf",
    version: "1.0.0",
    description: "Creates an array from values",
    unwrap: true,
    brackets: false,
    args: [forgescript_1.Arg.restString("values", "The elements of the array")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [values]) {
        return (0, source_1.answer)(this, (values ?? []).map(value_1.parseValue));
    },
});
//# sourceMappingURL=arrayOf.js.map