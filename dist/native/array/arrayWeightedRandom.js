"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayWeightedRandom",
    version: "1.0.0",
    description: "Picks a random element by weight",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.restString("key", "The key with the weight", true),
    ],
    output: forgescript_1.ArgType.Unknown,
    execute(ctx, [source, keys]) {
        const checked = (0, location_1.checkKeys)(keys);
        if (!checked.ok)
            return this.customError(checked.reason);
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const weights = list.value.map((item) => Math.max((0, value_1.numberOf)((0, location_1.readIn)(item, keys)) ?? 0, 0));
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        if (total <= 0)
            return this.success();
        let roll = Math.random() * total;
        let last = -1;
        for (let i = 0; i < weights.length; i++) {
            if (weights[i] <= 0)
                continue;
            roll -= weights[i];
            last = i;
            if (roll < 0)
                return (0, source_1.answer)(this, list.value[i]);
        }
        return (0, source_1.answer)(this, list.value[last]);
    },
});
//# sourceMappingURL=arrayWeightedRandom.js.map