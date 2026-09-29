"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const Location_1 = require("../../structures/Location");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonEquals",
    version: "1.0.0",
    description: "Checks whether two JSON values are equal, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("first", "The first value, as a variable or JSON"),
        forgescript_1.Arg.requiredString("second", "The second value, as a variable or JSON"),
    ],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [first, second]) {
        const left = new Location_1.Location(ctx, first).read();
        if (!left.ok)
            return this.customError(left.reason);
        const right = new Location_1.Location(ctx, second).read();
        if (!right.ok)
            return this.customError(right.reason);
        return this.success((0, compare_1.isEqual)(left.value, right.value));
    },
});
//# sourceMappingURL=jsonEquals.js.map