"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayPage",
    version: "1.0.0",
    description: "Returns one page of an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredNumber("page", "The page, starting from 1"),
        forgescript_1.Arg.requiredNumber("size", "The elements per page"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, page, size]) {
        if (!Number.isInteger(page) || page < 1)
            return this.customError(`There is no page ${page}, pages start at 1.`);
        if (!Number.isInteger(size) || size < 1)
            return this.customError(`A page can't hold ${size} elements.`);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return (0, source_1.answer)(this, list.value.slice((page - 1) * size, page * size));
    },
});
//# sourceMappingURL=arrayPage.js.map