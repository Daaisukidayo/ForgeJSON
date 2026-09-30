import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { readValues } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayUnshiftJSON",
    version: "1.1.0",
    description: "Adds JSON values to the start of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.restString("values", "The JSON values to add", true),
    ],
    execute(ctx, [variable, texts]) {
        const values = readValues(texts)
        if (!values.ok) return this.customError(values.reason)

        const list = new Location(ctx, variable).array()
        if (!list.ok) return this.customError(list.reason)

        list.value.unshift(...values.value)

        return this.success()
    },
})
