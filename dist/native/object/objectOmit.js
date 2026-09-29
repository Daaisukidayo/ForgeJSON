"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$objectOmit",
    version: "1.0.0",
    description: "Returns an object without the given keys",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The object, as a variable or JSON"),
        forgescript_1.Arg.restString("keys", "The keys to leave out", true),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, keys]) {
        const read = (0, source_1.readRecord)(ctx, source);
        if (!read.ok)
            return this.customError(read.reason);
        const left = new Set(keys);
        return (0, source_1.answer)(this, Object.fromEntries(Object.entries(read.value).filter(([key]) => !left.has(key))));
    },
});
//# sourceMappingURL=objectOmit.js.map