"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$objectPick",
    version: "1.0.0",
    description: "Returns an object with only the given keys",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The object, as a variable or JSON"),
        forgescript_1.Arg.restString("keys", "The keys to keep", true),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const read = (0, source_1.readRecord)(ctx, source);
        if (!read.ok)
            return this.customError(read.reason);
        const out = {};
        for (const key of keys)
            if (Object.hasOwn(read.value, key))
                out[key] = read.value[key];
        return (0, source_1.answer)(this, out);
    },
});
//# sourceMappingURL=objectPick.js.map