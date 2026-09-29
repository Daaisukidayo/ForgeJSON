"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayRange",
    version: "1.0.0",
    description: "Creates an array of numbers from start to end",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredNumber("start", "The first number"),
        forgescript_1.Arg.requiredNumber("end", "The last number"),
        forgescript_1.Arg.optionalNumber("step", "The step between numbers"),
    ],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [start, end, step]) {
        const by = typeof step === "number" ? step : start <= end ? 1 : -1;
        if (by === 0)
            return this.customError("A step of 0 never reaches the end.");
        if (Math.sign(end - start) === -Math.sign(by))
            return (0, source_1.answer)(this, []);
        const count = Math.floor((0, value_1.tidy)((end - start) / by)) + 1;
        return (0, source_1.answer)(this, Array.from({ length: count }, (_, i) => (0, value_1.tidy)(start + i * by)));
    },
});
//# sourceMappingURL=arrayRange.js.map