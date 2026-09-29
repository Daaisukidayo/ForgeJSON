"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayChunk",
    version: "1.0.0",
    description: "Splits an array into arrays of a given size",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredNumber("size", "The size of every chunk"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, size]) {
        if (!Number.isInteger(size) || size < 1)
            return this.customError(`A chunk can't hold ${size} elements.`);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const chunks = [];
        for (let i = 0; i < list.value.length; i += size)
            chunks.push(list.value.slice(i, i + size));
        return (0, source_1.answer)(this, chunks);
    },
});
//# sourceMappingURL=arrayChunk.js.map