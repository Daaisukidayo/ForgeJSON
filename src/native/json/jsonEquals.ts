import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isEqual } from "../../functions/compare"
import { Location } from "../../structures/Location"

export default new NativeFunction({
    name: "$jsonEquals",
    version: "1.0.0",
    description: "Checks whether two JSON values are equal, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("first", "The first value, as a variable or JSON"),
        Arg.requiredString("second", "The second value, as a variable or JSON"),
    ],
    output: ArgType.Boolean,
    execute(ctx, [first, second]) {
        const left = new Location(ctx, first).read()
        if (!left.ok) return this.customError(left.reason)

        const right = new Location(ctx, second).read()
        if (!right.ok) return this.customError(right.reason)

        return this.success(isEqual(left.value, right.value))
    },
})
