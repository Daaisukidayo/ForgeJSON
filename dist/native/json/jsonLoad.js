"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const Location_1 = require("../../structures/Location");
const result_1 = require("../../functions/result");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$jsonLoad",
    version: "1.0.0",
    description: "Loads JSON to an environment variable",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The variable to load JSON to"), forgescript_1.Arg.requiredString("json", "The JSON data")],
    execute(ctx, [variable, json]) {
        const parsed = (0, value_1.looksLikeJSON)(json) ? (0, value_1.readJSON)(json) : (0, result_1.ok)(json === "null" ? null : (0, value_1.parseScalar)(json));
        if (!parsed.ok)
            return this.customError(parsed.reason);
        const written = new Location_1.Location(ctx, variable).write(parsed.value);
        if (!written.ok)
            return this.customError(written.reason);
        return this.success();
    },
});
//# sourceMappingURL=jsonLoad.js.map