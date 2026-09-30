"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const Location_1 = require("../../structures/Location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonEntries",
    version: "1.1.0",
    description: "Gets entries from JSON",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The variable, or JSON"), forgescript_1.Arg.restString("keys", "The keys to follow")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source, keys]) {
        const at = new Location_1.Location(ctx, source, keys);
        const read = at.read();
        if (!read.ok)
            return this.customError(read.reason);
        const value = read.value;
        if (value !== undefined && value !== null && !(0, location_1.isContainer)(value)) {
            return this.customError(`"${at}" is ${(0, value_1.describe)(value)}, it has no entries.`);
        }
        return (0, source_1.answer)(this, (0, location_1.isContainer)(value) ? Object.entries(value) : []);
    },
});
//# sourceMappingURL=jsonEntries.js.map