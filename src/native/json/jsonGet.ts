import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { answer } from "../../functions/source"

export default new NativeFunction({
    name: "$jsonGet",
    version: "1.0.0",
    description: "Gets a value from JSON",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The variable, or JSON"), Arg.restString("keys", "The keys to follow")],
    output: ArgType.Unknown,
    execute(ctx, [source, keys]) {
        const read = new Location(ctx, source, keys).read()
        if (!read.ok) return this.customError(read.reason)

        return answer(this, read.value ?? undefined)
    },
})
