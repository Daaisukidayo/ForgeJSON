import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayPageCount",
    version: "1.0.0",
    description: "Returns the page count of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredNumber("size", "The elements per page"),
    ],
    output: ArgType.Number,
    execute(ctx, [source, size]) {
        if (!Number.isInteger(size) || size < 1) return this.customError(`A page can't hold ${size} elements.`)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return this.success(Math.max(1, Math.ceil(list.value.length / size)))
    },
})
