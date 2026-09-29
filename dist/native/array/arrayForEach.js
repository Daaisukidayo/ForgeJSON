"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const loop_1 = require("../../functions/loop");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayForEach",
    version: "1.0.0",
    description: "Loops through every element of the array",
    unwrap: false,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("variable", "The variable to load the element value to"),
        forgescript_1.Arg.requiredString("code", "The code to execute for every element"),
        forgescript_1.Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    async execute(ctx) {
        const code = this.data.fields[2];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3);
        if (!this["isValidReturnType"](rt))
            return rt;
        const stopped = await (0, loop_1.eachElement)(this, ctx, args, async () => {
            const run = await this["resolveCode"](ctx, code);
            if (!run.success)
                return run;
        });
        return stopped ?? this.success();
    },
});
//# sourceMappingURL=arrayForEach.js.map