import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isEqual } from "../../functions/compare"
import { readArray } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayLastIndexOf",
    version: "1.1.0",
    description: "Gets the index of the last element equal to a value",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("value", "The value to look for"),
    ],
    output: ArgType.Number,
    execute(ctx, [source, text]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const value = parseValue(text)
        let index = list.value.length - 1

        while (index >= 0 && !isEqual(list.value[index], value)) index--

        return this.success(index)
    },
})
