import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { SortType } from "@tryforge/forgescript/dist/native/array/arraySort"
import { sortBy } from "../../functions/compare"
import { answer, readArray, store } from "../../functions/source"
import { looksLikeJSON } from "../../functions/value"

export default new NativeFunction({
    name: "$arraySort",
    version: "1.1.0",
    description: "Sorts an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        Arg.optionalEnum(SortType, "sort type", "The sort type, asc or desc"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, other, order]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const sorted = sortBy(list.value, [], order === SortType.desc)
        if (other) return store(this, ctx, other, sorted)
        if (looksLikeJSON(source)) return answer(this, sorted)

        list.value.length = 0
        for (const item of sorted) list.value.push(item)

        return answer(this, list.value)
    },
})
