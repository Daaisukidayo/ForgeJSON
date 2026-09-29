"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayUnique",
    version: "1.0.0",
    description: "Removes duplicate elements from an array",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        forgescript_1.Arg.restString("key", "The key to compare by"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, other, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const seen = new Set();
        const unique = list.value.filter((item) => {
            const id = (0, compare_1.canonical)((0, location_1.readIn)(item, keys));
            if (seen.has(id))
                return false;
            seen.add(id);
            return true;
        });
        return (0, source_1.store)(this, ctx, other, unique);
    },
});
//# sourceMappingURL=arrayUnique.js.map