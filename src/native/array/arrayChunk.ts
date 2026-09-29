import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayChunk",
    version: "1.0.0",
    description: "Splits an array into arrays of a given size",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredNumber("size", "The size of every chunk"),
    ],
    output: ArgType.Json,
    execute(ctx, [source, size]) {
        if (!Number.isInteger(size) || size < 1) return this.customError(`A chunk can't hold ${size} elements.`)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const chunks: unknown[][] = []
        for (let i = 0; i < list.value.length; i += size) chunks.push(list.value.slice(i, i + size))

        return answer(this, chunks)
    },
})
