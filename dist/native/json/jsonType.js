"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonType",
    version: "1.0.0",
    description: "Returns the type of a JSON value",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The variable, or JSON"), forgescript_1.Arg.restString("keys", "The keys to follow")],
    output: forgescript_1.ArgType.String,
    execute(ctx, [source, keys]) {
        const read = new Location_1.Location(ctx, source, keys).read();
        if (!read.ok)
            return this.customError(read.reason);
        return this.success((0, value_1.typeOf)(read.value));
    },
});
//# sourceMappingURL=jsonType.js.map