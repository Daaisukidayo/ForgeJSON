import { Arg, NativeFunction } from "@tryforge/forgescript"
import { splitLast } from "../../functions/location"
import { Location } from "../../structures/Location"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayPushAt",
    version: "1.0.0",
    description: "Appends a value to an array nested in JSON",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.restString("keys;value", "The keys to follow, then the value", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, value] = splitLast(rest)

        const list = new Location(ctx, variable, keys).array()
        if (!list.ok) return this.customError(list.reason)

        list.value.push(parseValue(value))

        return this.success()
    },
})
