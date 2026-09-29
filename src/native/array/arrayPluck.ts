import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { checkKeys, readIn } from "../../functions/location"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayPluck",
    version: "1.0.0",
    description: "Returns the values of a key from every element",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.restString("key", "The key to read", true),
    ],
    output: ArgType.Json,
    execute(ctx, [source, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return answer(
            this,
            list.value.map((item) => readIn(item, keys) ?? null)
        )
    },
})
