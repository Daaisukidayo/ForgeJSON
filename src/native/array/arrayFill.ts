import { Arg, NativeFunction } from "@tryforge/forgescript"
import { copy } from "../../functions/edit"
import { Location } from "../../structures/Location"
import { readValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayFill",
    version: "1.1.0",
    description: "Fills an array with a value",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.requiredString("value", "The value to fill the array with"),
    ],
    execute(ctx, [variable, text]) {
        const value = readValue(text)
        if (!value.ok) return this.customError(value.reason)

        const list = new Location(ctx, variable).array({ create: false })
        if (!list.ok) return this.customError(list.reason)
        if (!list.value) return this.success()

        for (let i = 0; i < list.value.length; i++) list.value[i] = copy(value.value)

        return this.success()
    },
})
