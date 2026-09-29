"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonStringify",
    version: "1.0.0",
    description: "Returns the JSON in stringified format",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The variable, or JSON"), forgescript_1.Arg.optionalNumber("space", "The space to use")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, space]) {
        const read = (0, value_1.looksLikeJSON)(source) ? (0, value_1.readLooseJSON)(source) : new Location_1.Location(ctx, source).read();
        if (!read.ok)
            return this.customError(read.reason);
        if (read.value === undefined)
            return this.success();
        return this.success((0, value_1.stringify)(read.value, typeof space === "number" && space > 0 ? space : undefined));
    },
});
//# sourceMappingURL=jsonStringify.js.map