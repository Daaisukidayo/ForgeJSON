import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { answer } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayShift",
    version: "1.0.0",
    description: "Removes the first element of an array and returns it",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The variable that holds the array")],
    output: ArgType.Unknown,
    execute(ctx, [variable]) {
        const list = new Location(ctx, variable).array({ create: false })
        if (!list.ok) return this.customError(list.reason)

        return list.value ? answer(this, list.value.shift()) : this.success()
    },
})
