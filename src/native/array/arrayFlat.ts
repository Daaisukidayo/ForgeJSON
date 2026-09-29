import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayFlat",
    version: "1.0.0",
    description: "Flattens the arrays nested in an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalNumber("depth", "The depth to flatten to"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, depth]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return answer(this, list.value.flat(typeof depth === "number" ? Math.max(depth, 0) : 1))
    },
})
