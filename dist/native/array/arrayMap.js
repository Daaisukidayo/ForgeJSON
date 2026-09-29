"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const loop_1 = require("../../functions/loop");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayMap",
    version: "1.0.0",
    description: "Maps through every element of the array",
    unwrap: false,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("variable", "The variable to load the element value to"),
        forgescript_1.Arg.requiredString("code", "The code to execute for every element"),
        forgescript_1.Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        forgescript_1.Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: forgescript_1.ArgType.Json,
    async execute(ctx) {
        const code = this.data.fields[2];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3, 4);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [source, variable, other, index] = args;
        const out = [];
        const stopped = await (0, loop_1.eachElement)(this, ctx, [source, variable, index], async () => {
            const run = await this["resolveCode"](ctx, code);
            if (run.return)
                out.push((0, value_1.parseValue)(`${run.value ?? ""}`));
            else if (!run.success)
                return run;
            else {
                const text = `${run.value ?? ""}`.trim();
                if (text)
                    out.push((0, value_1.parseValue)(text));
            }
        });
        return stopped ?? (0, source_1.store)(this, ctx, other, out);
    },
});
//# sourceMappingURL=arrayMap.js.map