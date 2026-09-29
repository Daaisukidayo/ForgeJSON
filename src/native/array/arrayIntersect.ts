import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { canonical } from "../../functions/compare"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayIntersect",
    version: "1.0.0",
    description: "Returns the elements found in both arrays",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("first", "The array to keep elements from, as a variable or JSON"),
        Arg.requiredString("second", "The array to compare with, as a variable or JSON"),
    ],
    output: ArgType.Json,
    execute(ctx, [first, second]) {
        const kept = readArray(ctx, first)
        if (!kept.ok) return this.customError(kept.reason)

        const other = readArray(ctx, second)
        if (!other.ok) return this.customError(other.reason)

        const wanted = new Set(other.value.map(canonical))
        const seen = new Set<string>()

        return answer(
            this,
            kept.value.filter((item) => {
                const id = canonical(item)
                if (!wanted.has(id) || seen.has(id)) return false

                seen.add(id)
                return true
            })
        )
    },
})
