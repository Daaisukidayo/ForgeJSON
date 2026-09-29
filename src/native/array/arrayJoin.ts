import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { readArray } from "../../functions/source"
import { joinTexts } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayJoin",
    version: "1.0.0",
    description: "Joins all elements of an array with a separator",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.optionalString("separator", "The separator to use for every element"),
    ],
    output: ArgType.String,
    execute(ctx, [source, separator]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return this.success(joinTexts(list.value, separator ?? ", "))
    },
})
