"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const loop_1 = require("../../functions/loop");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayFindLast",
    version: "1.0.0",
    description: "Finds the last element of the array that passes a condition",
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
    output: forgescript_1.ArgType.Unknown,
    async execute(ctx) {
        const condition = this.data.fields[2];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [source, variable, index] = args;
        let found;
        const stopped = await (0, loop_1.testEach)(this, ctx, [source, variable, index], condition, (item) => {
            found = item;
            return true;
        }, { fromEnd: true });
        if (stopped)
            return stopped;
        return (0, source_1.answer)(this, found);
    },
});
//# sourceMappingURL=arrayFindLast.js.map