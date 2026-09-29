import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { shuffle } from "../../functions/random"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arraySample",
    version: "1.0.0",
    description: "Picks random elements from an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalNumber("count", "The number of elements to pick"),
    ],
    output: [ArgType.Unknown, ArgType.Json],
    execute(ctx, [source, count]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        if (typeof count !== "number") return answer(this, shuffle(list.value, 1)[0])
        if (!Number.isInteger(count) || count < 0) return this.customError(`Can't pick ${count} elements.`)

        return answer(this, shuffle(list.value, count))
    },
})
