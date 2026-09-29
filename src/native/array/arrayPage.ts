import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayPage",
    version: "1.0.0",
    description: "Returns one page of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredNumber("page", "The page, starting from 1"),
        Arg.requiredNumber("size", "The elements per page"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, page, size]) {
        if (!Number.isInteger(page) || page < 1) return this.customError(`There is no page ${page}, pages start at 1.`)
        if (!Number.isInteger(size) || size < 1) return this.customError(`A page can't hold ${size} elements.`)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        return answer(this, list.value.slice((page - 1) * size, page * size))
    },
})
