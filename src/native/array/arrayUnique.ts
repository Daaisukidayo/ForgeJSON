import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { canonical } from "../../functions/compare"
import { checkKeys, readIn } from "../../functions/location"
import { readArray, store } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayUnique",
    version: "1.0.0",
    description: "Removes duplicate elements from an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        Arg.restString("key", "The key to compare by"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, other, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const seen = new Set<string>()
        const unique = list.value.filter((item) => {
            const id = canonical(readIn(item, keys))
            if (seen.has(id)) return false

            seen.add(id)
            return true
        })

        return store(this, ctx, other, unique)
    },
})
