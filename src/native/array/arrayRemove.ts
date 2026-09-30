import { Arg, NativeFunction } from "@tryforge/forgescript"
import { isEqual } from "../../functions/compare"
import { Location } from "../../structures/Location"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayRemove",
    version: "1.0.0",
    description: "Removes every element equal to the given values",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.restString("values", "The values to remove", true),
    ],
    execute(ctx, [variable, values]) {
        const list = new Location(ctx, variable).array({ create: false })
        if (!list.ok) return this.customError(list.reason)
        if (!list.value) return this.success()

        const wanted = values.map(parseValue)
        const kept = list.value.filter((item) => !wanted.some((value) => isEqual(item, value)))

        list.value.length = 0
        for (const item of kept) list.value.push(item)

        return this.success()
    },
})
