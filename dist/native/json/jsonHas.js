"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonHas",
    version: "1.0.0",
    description: "Checks whether a key exists in JSON, returns bool",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The variable, or JSON"), forgescript_1.Arg.restString("keys", "The keys to follow")],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [source, keys]) {
        const read = new Location_1.Location(ctx, source, keys).read();
        if (!read.ok)
            return this.customError(read.reason);
        return this.success(read.value !== undefined);
    },
});
//# sourceMappingURL=jsonHas.js.map