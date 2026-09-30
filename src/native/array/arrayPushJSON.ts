import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { readValues } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayPushJSON",
    version: "1.1.0",
    description: "Appends JSON values to the end of an array",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.restString("values", "The JSON values to append", true),
    ],
    execute(ctx, [variable, texts]) {
        const values = readValues(texts)
        if (!values.ok) return this.customError(values.reason)

        const list = new Location(ctx, variable).array()
        if (!list.ok) return this.customError(list.reason)

        for (const value of values.value) list.value.push(value)

        return this.success()
    },
})
