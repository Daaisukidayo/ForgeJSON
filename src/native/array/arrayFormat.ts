import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { readArray } from "../../functions/source"
import { fill, parseTemplate } from "../../functions/template"

export default new NativeFunction({
    name: "$arrayFormat",
    version: "1.0.0",
    description: "Formats every element of the array with a template",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("template", "The line to write for every element"),
        Arg.optionalNumber("page", "The page to write"),
        Arg.optionalNumber("size", "The lines per page"),
        Arg.optionalString("separator", "The separator to use for every line"),
    ],
    output: ArgType.String,
    execute(ctx, [source, template, page, size, separator]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const perPage = typeof size === "number" ? size : list.value.length
        const at = typeof page === "number" ? page : 1

        if (!Number.isInteger(at) || at < 1) return this.customError(`There is no page ${at}, pages start at 1.`)
        if (typeof size === "number" && (!Number.isInteger(size) || size < 1)) {
            return this.customError(`A page can't hold ${size} lines.`)
        }

        const first = (at - 1) * perPage
        const parts = parseTemplate(template)
        const lines = list.value.slice(first, first + perPage).map((item, i) => fill(parts, item, first + i + 1))

        return this.success(lines.join(separator ?? "\n"))
    },
})
