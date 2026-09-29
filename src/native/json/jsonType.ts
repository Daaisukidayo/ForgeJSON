import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { typeOf } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonType",
    version: "1.0.0",
    description: "Returns the type of a JSON value",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The variable, or JSON"), Arg.restString("keys", "The keys to follow")],
    output: ArgType.String,
    execute(ctx, [source, keys]) {
        const read = new Location(ctx, source, keys).read()
        if (!read.ok) return this.customError(read.reason)

        return this.success(typeOf(read.value))
    },
})
