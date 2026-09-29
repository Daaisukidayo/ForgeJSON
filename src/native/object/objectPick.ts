import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { checkKeys } from "../../functions/location"
import { answer, readRecord } from "../../functions/source"

export default new NativeFunction({
    name: "$objectPick",
    version: "1.0.0",
    description: "Returns an object with only the given keys",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The object, as a variable or JSON"),
        Arg.restString("keys", "The keys to keep", true),
    ],
    output: ArgType.Json,
    execute(ctx, [source, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const read = readRecord(ctx, source)
        if (!read.ok) return this.customError(read.reason)

        const out: Record<string, unknown> = {}
        for (const key of keys) if (Object.hasOwn(read.value, key)) out[key] = read.value[key]

        return answer(this, out)
    },
})
