import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isRecord } from "../../functions/location"
import { Location } from "../../structures/Location"
import { describe } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonSize",
    version: "1.0.0",
    description: "Returns the size of a JSON value",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The variable, or JSON"), Arg.restString("keys", "The keys to follow")],
    output: ArgType.Number,
    execute(ctx, [source, keys]) {
        const at = new Location(ctx, source, keys)
        const read = at.read()
        if (!read.ok) return this.customError(read.reason)

        const value = read.value
        if (value === undefined || value === null) return this.success(0)
        if (Array.isArray(value) || typeof value === "string") return this.success(value.length)
        if (isRecord(value)) return this.success(Object.keys(value).length)

        return this.customError(`"${at}" is ${describe(value)}, it has no size.`)
    },
})
