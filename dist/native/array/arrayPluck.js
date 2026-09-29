"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayPluck",
    version: "1.0.0",
    description: "Returns the values of a key from every element",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.restString("key", "The key to read", true),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        return (0, source_1.answer)(this, list.value.map((item) => (0, location_1.readIn)(item, keys) ?? null));
    },
});
//# sourceMappingURL=arrayPluck.js.map