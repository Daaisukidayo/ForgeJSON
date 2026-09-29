import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { canonical } from "../../functions/compare"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayDiff",
    version: "1.0.0",
    description: "Returns the elements of the first array missing from the second",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("first", "The array to keep elements from, as a variable or JSON"),
        Arg.requiredString("second", "The array of elements to remove, as a variable or JSON"),
    ],
    output: ArgType.Json,
    execute(ctx, [first, second]) {
        const kept = readArray(ctx, first)
        if (!kept.ok) return this.customError(kept.reason)

        const other = readArray(ctx, second)
        if (!other.ok) return this.customError(other.reason)

        const left = new Set(other.value.map(canonical))
        return answer(
            this,
            kept.value.filter((item) => !left.has(canonical(item)))
        )
    },
})
