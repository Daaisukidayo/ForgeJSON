import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { numbersIn } from "../../functions/compare"
import { checkKeys } from "../../functions/location"
import { readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayMin",
    version: "1.0.0",
    description: "Returns the smallest value of a key in the array",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The array, as a variable or JSON"), Arg.restString("key", "The key to read")],
    output: ArgType.Number,
    execute(ctx, [source, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const numbers = numbersIn(list.value, keys)
        if (!numbers.length) return this.success()

        return this.success(numbers.reduce((min, number) => (number < min ? number : min)))
    },
})
