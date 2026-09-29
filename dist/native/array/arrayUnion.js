"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const compare_1 = require("../../functions/compare");
const source_1 = require("../../functions/source");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayUnion",
    version: "1.0.0",
    description: "Combines arrays without repeats",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.restString("sources", "The arrays, each a variable or JSON", true)],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [sources]) {
        const seen = new Set();
        const out = [];
        for (const source of sources) {
            const list = (0, source_1.readArray)(ctx, source);
            if (!list.ok)
                return this.customError(list.reason);
            for (const item of list.value) {
                const id = (0, compare_1.canonical)(item);
                if (seen.has(id))
                    continue;
                seen.add(id);
                out.push(item);
            }
        }
        return (0, source_1.answer)(this, out);
    },
});
//# sourceMappingURL=arrayUnion.js.map