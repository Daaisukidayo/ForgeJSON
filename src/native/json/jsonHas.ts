import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"

export default new NativeFunction({
    name: "$jsonHas",
    version: "1.0.0",
    description: "Checks whether a key exists in JSON, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The variable, or JSON"), Arg.restString("keys", "The keys to follow")],
    output: ArgType.Boolean,
    execute(ctx, [source, keys]) {
        const read = new Location(ctx, source, keys).read()
        if (!read.ok) return this.customError(read.reason)

        return this.success(read.value !== undefined)
    },
})
