import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { SortType } from "@tryforge/forgescript/dist/native/array/arraySort"
import { sortBy } from "../../functions/compare"
import { checkKeys } from "../../functions/location"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arraySortBy",
    version: "1.0.0",
    description: "Sorts an array by a key",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalEnum(SortType, "sort type", "The sort type, asc or desc"),
        Arg.restString("key", "The key to sort by"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, order, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return answer(this, sortBy(list.value, keys, order === SortType.desc))
    },
})
