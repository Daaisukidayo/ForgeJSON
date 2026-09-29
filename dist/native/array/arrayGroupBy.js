"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayGroupBy",
    version: "1.0.0",
    description: "Groups the elements of the array by a key",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.restString("key", "The key to group by", true),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const groups = new Map();
        for (const item of list.value) {
            const name = (0, value_1.toText)((0, location_1.readIn)(item, keys)) ?? "";
            const group = groups.get(name);
            if (group)
                group.push(item);
            else
                groups.set(name, [item]);
        }
        return (0, source_1.answer)(this, Object.fromEntries(groups));
    },
});
//# sourceMappingURL=arrayGroupBy.js.map