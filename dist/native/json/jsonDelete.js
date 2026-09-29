"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonDelete",
    version: "1.0.0",
    description: "Deletes a key from JSON, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the JSON"),
        forgescript_1.Arg.restString("keys", "The keys to follow"),
    ],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [variable, keys]) {
        const removed = new Location_1.Location(ctx, variable, keys).delete();
        if (!removed.ok)
            return this.customError(removed.reason);
        return this.success(removed.value);
    },
});
//# sourceMappingURL=jsonDelete.js.map