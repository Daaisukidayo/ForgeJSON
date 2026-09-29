import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isContainer } from "../../functions/location"
import { Location } from "../../structures/Location"
import { label } from "../../functions/source"
import { describe, stringify } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonValues",
    version: "1.0.0",
    description: "Gets values from JSON",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The variable, or JSON"),
        Arg.optionalString("separator", "The separator to use for every value"),
    ],
    output: ArgType.String,
    execute(ctx, [source, separator]) {
        const read = new Location(ctx, source).read()
        if (!read.ok) return this.customError(read.reason)

        const value = read.value
        if (value !== undefined && value !== null && !isContainer(value)) {
            return this.customError(`${label(source)} is ${describe(value)}, it has no values.`)
        }

        const values = isContainer(value) ? Object.values(value) : []
        return this.success(
            values.map((item) => (typeof item === "string" ? item : stringify(item))).join(separator ?? ", ")
        )
    },
})
