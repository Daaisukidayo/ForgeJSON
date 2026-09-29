"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayPageCount",
    version: "1.0.0",
    description: "Returns the page count of an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredNumber("size", "The elements per page"),
    ],
    output: forgescript_1.ArgType.Number,
    execute(ctx, [source, size]) {
        if (!Number.isInteger(size) || size < 1)
            return this.customError(`A page can't hold ${size} elements.`);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return this.success(Math.max(1, Math.ceil(list.value.length / size)));
    },
});
//# sourceMappingURL=arrayPageCount.js.map