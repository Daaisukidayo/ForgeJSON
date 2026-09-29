import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"

export default new NativeFunction({
    name: "$jsonDelete",
    version: "1.0.0",
    description: "Deletes a key from JSON, returns bool",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the JSON"),
        Arg.restString("keys", "The keys to follow"),
    ],
    output: ArgType.Boolean,
    execute(ctx, [variable, keys]) {
        const removed = new Location(ctx, variable, keys).delete()
        if (!removed.ok) return this.customError(removed.reason)

        return this.success(removed.value)
    },
})
