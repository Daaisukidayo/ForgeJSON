import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayPush",
    version: "1.0.0",
    description: "Appends values to the end of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.restString("values", "The values to append", true),
    ],
    execute(ctx, [variable, values]) {
        const list = new Location(ctx, variable).array()
        if (!list.ok) return this.customError(list.reason)

        for (const value of values) list.value.push(parseValue(value))

        return this.success()
    },
})
