import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer, readRecord } from "../../functions/source"

export default new NativeFunction({
    name: "$objectOmit",
    version: "1.0.0",
    description: "Returns an object without the given keys",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The object, as a variable or JSON"),
        Arg.restString("keys", "The keys to leave out", true),
    ],
    output: ArgType.Json,
    execute(ctx, [source, keys]) {
        const read = readRecord(ctx, source)
        if (!read.ok) return this.customError(read.reason)

        const left = new Set(keys)
        return answer(this, Object.fromEntries(Object.entries(read.value).filter(([key]) => !left.has(key))))
    },
})
