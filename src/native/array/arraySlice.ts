import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { readArray, store } from "../../functions/source"

export default new NativeFunction({
    name: "$arraySlice",
    version: "1.0.0",
    description: "Returns part of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        Arg.requiredNumber("start", "The index to start at"),
        Arg.optionalNumber("end", "The index to stop before"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, other, start, end]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return store(this, ctx, other, list.value.slice(start, typeof end === "number" && end ? end : undefined))
    },
})
