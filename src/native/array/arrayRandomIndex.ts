import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayRandomIndex",
    version: "1.1.0",
    description: "Returns a random index of an array",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The array, as a variable or JSON")],
    output: ArgType.Number,
    execute(ctx, [source]) {
        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        if (!list.value.length) return this.success()

        return this.success(Math.floor(Math.random() * list.value.length))
    },
})
