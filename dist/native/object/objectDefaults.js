"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const edit_1 = require("../../functions/edit");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$objectDefaults",
    version: "1.0.0",
    description: "Fills the missing keys of an object with defaults",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable that holds the object"),
        forgescript_1.Arg.restString("keys;defaults", "The keys to follow, then the defaults, as a variable or JSON", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, source] = (0, location_1.splitLast)(rest);
        const defaults = (0, source_1.readRecord)(ctx, source);
        if (!defaults.ok)
            return this.customError(defaults.reason);
        const target = new Location_1.Location(ctx, variable, keys).record();
        if (!target.ok)
            return this.customError(target.reason);
        (0, edit_1.defaultsInto)(target.value, defaults.value);
        return this.success();
    },
});
//# sourceMappingURL=objectDefaults.js.map