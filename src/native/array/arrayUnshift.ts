import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayUnshift",
    version: "1.0.0",
    description: "Adds values to the start of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.restString("values", "The values to add", true),
    ],
    execute(ctx, [variable, values]) {
        const list = new Location(ctx, variable).array()
        if (!list.ok) return this.customError(list.reason)

        list.value.unshift(...values.map(parseValue))

        return this.success()
    },
})
