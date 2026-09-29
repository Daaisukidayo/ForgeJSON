import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer, readArray, store } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayReverse",
    version: "1.0.0",
    description: "Reverses an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, other]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        if (other) return store(this, ctx, other, [...list.value].reverse())

        return answer(this, list.value.reverse())
    },
})
