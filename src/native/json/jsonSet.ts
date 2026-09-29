import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { splitLast } from "../../functions/location"
import { Location } from "../../structures/Location"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonSet",
    version: "1.0.0",
    description: "Sets a JSON key to a value, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the JSON"),
        Arg.restString("keys;value", "The keys to follow, then the value", true),
    ],
    output: ArgType.Boolean,
    execute(ctx, [variable, rest]) {
        const [keys, value] = splitLast(rest)

        const written = new Location(ctx, variable, keys).write(parseValue(value))
        if (!written.ok) return this.customError(written.reason)

        return this.success(true)
    },
})
