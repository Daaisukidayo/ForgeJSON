import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { numbersIn } from "../../functions/compare"
import { checkKeys } from "../../functions/location"
import { readArray } from "../../functions/source"
import { tidy } from "../../functions/value"

export default new NativeFunction({
    name: "$arraySum",
    version: "1.0.0",
    description: "Returns the sum of a key in the array",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The array, as a variable or JSON"), Arg.restString("key", "The key to sum")],
    output: ArgType.Number,
    execute(ctx, [source, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return this.success(tidy(numbersIn(list.value, keys).reduce((sum, number) => sum + number, 0)))
    },
})
