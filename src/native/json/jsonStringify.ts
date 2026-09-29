import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { looksLikeJSON, readLooseJSON, stringify } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonStringify",
    version: "1.0.0",
    description: "Returns the JSON in stringified format",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The variable, or JSON"), Arg.optionalNumber("space", "The space to use")],
    output: ArgType.Json,
    execute(ctx, [source, space]) {
        const read = looksLikeJSON(source) ? readLooseJSON(source) : new Location(ctx, source).read()
        if (!read.ok) return this.customError(read.reason)
        if (read.value === undefined) return this.success()

        return this.success(stringify(read.value, typeof space === "number" && space > 0 ? space : undefined))
    },
})
