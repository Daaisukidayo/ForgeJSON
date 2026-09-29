"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonToggle",
    version: "1.0.0",
    description: "Toggles a boolean in JSON",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the boolean"),
        forgescript_1.Arg.restString("keys", "The keys to follow"),
    ],
    execute(ctx, [variable, keys]) {
        const at = new Location_1.Location(ctx, variable, keys);
        const current = at.read();
        if (!current.ok)
            return this.customError(current.reason);
        const value = current.value;
        let next;
        if (value === undefined || value === null)
            next = true;
        else if (typeof value === "boolean")
            next = !value;
        else if (value === "true" || value === "false")
            next = value === "false";
        else
            return this.customError(`"${at}" is ${(0, value_1.describe)(value)}, not a boolean.`);
        const written = at.write(next);
        if (!written.ok)
            return this.customError(written.reason);
        return this.success();
    },
});
//# sourceMappingURL=jsonToggle.js.map