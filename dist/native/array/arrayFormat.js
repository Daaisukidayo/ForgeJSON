"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const source_1 = require("../../functions/source");
const template_1 = require("../../functions/template");
exports.default = new forgescript_1.NativeFunction({
    name: "$arrayFormat",
    version: "1.0.0",
    description: "Formats every element of the array with a template",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("source", "The array, as a variable or JSON"),
        forgescript_1.Arg.requiredString("template", "The line to write for every element"),
        forgescript_1.Arg.optionalNumber("page", "The page to write"),
        forgescript_1.Arg.optionalNumber("size", "The lines per page"),
        forgescript_1.Arg.optionalString("separator", "The separator to use for every line"),
    ],
    output: forgescript_1.ArgType.String,
    execute(ctx, [source, template, page, size, separator]) {
        const list = (0, source_1.readArray)(ctx, source);
        if (!list.ok)
            return this.customError(list.reason);
        const perPage = typeof size === "number" ? size : list.value.length;
        const at = typeof page === "number" ? page : 1;
        if (!Number.isInteger(at) || at < 1)
            return this.customError(`There is no page ${at}, pages start at 1.`);
        if (typeof size === "number" && (!Number.isInteger(size) || size < 1)) {
            return this.customError(`A page can't hold ${size} lines.`);
        }
        const first = (at - 1) * perPage;
        const parts = (0, template_1.parseTemplate)(template);
        const lines = list.value.slice(first, first + perPage).map((item, i) => (0, template_1.fill)(parts, item, first + i + 1));
        return this.success(lines.join(separator ?? "\n"));
    },
});
//# sourceMappingURL=arrayFormat.js.map