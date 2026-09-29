"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayShift",
    version: "1.0.0",
    description: "Removes the first element of an array and returns it",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The variable that holds the array")],
    output: forgescript_1.ArgType.Unknown,
    execute(ctx, [variable]) {
        const list = new Location_1.Location(ctx, variable).array({ create: false });
        if (!list.ok)
            return this.customError(list.reason);
        return list.value ? (0, source_1.answer)(this, list.value.shift()) : this.success();
    },
});
//# sourceMappingURL=arrayShift.js.map