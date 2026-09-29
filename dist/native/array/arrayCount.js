"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const loop_1 = require("../../functions/loop");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayCount",
    version: "1.0.0",
    description: "Counts the elements of the array that pass a condition",
    unwrap: false,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("variable", "The variable to load the element value to"),
        {
            ...forgescript_1.Arg.requiredString("condition", "The condition"),
            condition: true,
        },
        forgescript_1.Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: forgescript_1.ArgType.Number,
    async execute(ctx) {
        const condition = this.data.fields[2];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [source, variable, index] = args;
        let count = 0;
        const stopped = await (0, loop_1.testEach)(this, ctx, [source, variable, index], condition, () => void count++);
        if (stopped)
            return stopped;
        return this.success(count);
    },
});
//# sourceMappingURL=arrayCount.js.map