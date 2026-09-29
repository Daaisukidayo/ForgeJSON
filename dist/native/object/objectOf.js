"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$objectOf",
    version: "1.0.0",
    description: "Creates an object from keys and values",
    unwrap: true,
    brackets: false,
    args: [forgescript_1.Arg.restString("pairs", "The keys and values, in pairs")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [pairs]) {
        const given = pairs ?? [];
        if (given.length % 2) {
            return this.customError(`Every key needs a value, and "${given.at(-1)}" was left without one.`);
        }
        const out = {};
        for (let i = 0; i < given.length; i += 2) {
            const key = given[i];
            if (location_1.FORBIDDEN_KEYS.has(key)) {
                return this.customError(`"${key}" can't be used as a key, it leads to the prototype.`);
            }
            out[key] = (0, value_1.parseValue)(given[i + 1]);
        }
        return (0, source_1.answer)(this, out);
    },
});
//# sourceMappingURL=objectOf.js.map