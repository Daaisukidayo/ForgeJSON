"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const value_1 = require("../../functions/value");
const random_1 = require("../../functions/random");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayShuffle",
    version: "1.0.0",
    description: "Shuffles an array",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [source]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const shuffled = (0, random_1.shuffle)(list.value);
        if ((0, value_1.looksLikeJSON)(source))
            return (0, source_1.answer)(this, shuffled);
        list.value.length = 0;
        for (const item of shuffled)
            list.value.push(item);
        return this.success();
    },
});
//# sourceMappingURL=arrayShuffle.js.map