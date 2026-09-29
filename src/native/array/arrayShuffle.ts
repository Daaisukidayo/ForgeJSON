import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { looksLikeJSON } from "../../functions/value"
import { shuffle } from "../../functions/random"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayShuffle",
    version: "1.0.0",
    description: "Shuffles an array",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The array, as a variable or JSON")],
    output: ArgType.Json,
    execute(ctx, [source]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const shuffled = shuffle(list.value)
        if (looksLikeJSON(source)) return answer(this, shuffled)

        list.value.length = 0
        for (const item of shuffled) list.value.push(item)

        return this.success()
    },
})
