import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isEqual } from "../../functions/compare"
import { readArray } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayIncludes",
    version: "1.0.0",
    description: "Checks whether a value exists in an array, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("value", "The value to look for"),
    ],
    output: ArgType.Boolean,
    execute(ctx, [source, text]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const value = parseValue(text)
        return this.success(list.value.some((item) => isEqual(item, value)))
    },
})
