import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { parseScalar } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayLoad",
    version: "1.0.0",
    description: "Loads an array to an environment variable",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable to load the array to"),
        Arg.optionalString("separator", "The separator to use for the array elements"),
        Arg.restString("values", "The elements of the array"),
    ],
    execute(ctx, [variable, separator, values]) {
        const items = separator === null ? [] : values.join(";").split(separator).map(parseScalar)

        const written = new Location(ctx, variable).write(items)
        if (!written.ok) return this.customError(written.reason)

        return this.success()
    },
})
