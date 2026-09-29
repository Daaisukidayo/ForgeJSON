"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayLoad",
    version: "1.0.0",
    description: "Loads an array to an environment variable",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable to load the array to"),
        forgescript_1.Arg.optionalString("separator", "The separator to use for the array elements"),
        forgescript_1.Arg.restString("values", "The elements of the array"),
    ],
    execute(ctx, [variable, separator, values]) {
        const items = separator === null ? [] : values.join(";").split(separator).map(value_1.parseScalar);
        const written = new Location_1.Location(ctx, variable).write(items);
        if (!written.ok)
            return this.customError(written.reason);
        return this.success();
    },
});
//# sourceMappingURL=arrayLoad.js.map