"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const location_1 = require("../../functions/location");
const loop_1 = require("../../functions/loop");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayReduce",
    version: "1.0.0",
    description: "Reduces an array to a single value",
    unwrap: false,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("variable", "The variable to load the carried value to"),
        forgescript_1.Arg.requiredString("other variable", "The variable to load the element value to"),
        forgescript_1.Arg.requiredString("code", "The code to execute for every element"),
        forgescript_1.Arg.optionalString("default value", "The value to start from"),
        forgescript_1.Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: forgescript_1.ArgType.Unknown,
    async execute(ctx) {
        const code = this.data.fields[3];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 2, 4, 5);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [source, carried, variable, start, index] = args;
        if (!carried)
            return this.customError("The loop needs a variable to carry the value in.");
        const kept = (0, location_1.checkKeys)([carried]);
        if (!kept.ok)
            return this.customError(kept.reason);
        const carry = (value) => ctx.setEnvironmentKey(carried, value);
        const giveBack = (0, loop_1.borrow)(ctx, [carried]);
        try {
            carry(start ? (0, value_1.parseValue)(start) : 0);
            const stopped = await (0, loop_1.eachElement)(this, ctx, [source, variable, index], async () => {
                const run = await this["resolveCode"](ctx, code);
                if (run.return)
                    carry((0, value_1.parseValue)(`${run.value ?? ""}`));
                else if (!run.success)
                    return run;
                else {
                    const text = `${run.value ?? ""}`.trim();
                    if (text)
                        carry((0, value_1.parseValue)(text));
                }
            });
            return stopped ?? (0, source_1.answer)(this, (0, location_1.readVariable)(ctx, carried));
        }
        finally {
            giveBack();
        }
    },
});
//# sourceMappingURL=arrayReduce.js.map