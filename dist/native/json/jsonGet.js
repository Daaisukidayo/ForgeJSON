"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonGet",
    version: "1.0.0",
    description: "Gets a value from JSON",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The variable, or JSON"), forgescript_1.Arg.restString("keys", "The keys to follow")],
    output: forgescript_1.ArgType.Unknown,
    execute(ctx, [source, keys]) {
        const read = new Location_1.Location(ctx, source, keys).read();
        if (!read.ok)
            return this.customError(read.reason);
        return (0, source_1.answer)(this, read.value ?? undefined);
    },
});
//# sourceMappingURL=jsonGet.js.map