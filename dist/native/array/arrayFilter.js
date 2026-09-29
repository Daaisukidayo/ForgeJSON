"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const loop_1 = require("../../functions/loop");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayFilter",
    version: "1.0.0",
    description: "Filters the elements of the array that pass a condition",
    unwrap: false,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("variable", "The variable to load the element value to"),
        {
            ...forgescript_1.Arg.requiredString("condition", "The condition"),
            condition: true,
        },
        forgescript_1.Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        forgescript_1.Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: forgescript_1.ArgType.Json,
    async execute(ctx) {
        const condition = this.data.fields[2];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3, 4);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [source, variable, other, index] = args;
        const out = [];
        const stopped = await (0, loop_1.testEach)(this, ctx, [source, variable, index], condition, (item) => void out.push(item));
        if (stopped)
            return stopped;
        return (0, source_1.store)(this, ctx, other, out);
    },
});
//# sourceMappingURL=arrayFilter.js.map