"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayRandomIndex",
    version: "1.1.0",
    description: "Returns a random index of an array",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON")],
    output: forgescript_1.ArgType.Number,
    execute(ctx, [source]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        if (!list.value.length)
            return this.success();
        return this.success(Math.floor(Math.random() * list.value.length));
    },
});
//# sourceMappingURL=arrayRandomIndex.js.map