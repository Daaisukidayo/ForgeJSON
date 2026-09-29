import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { describe } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonToggle",
    version: "1.0.0",
    description: "Toggles a boolean in JSON",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the boolean"),
        Arg.restString("keys", "The keys to follow"),
    ],
    execute(ctx, [variable, keys]) {
        const at = new Location(ctx, variable, keys)
        const current = at.read()
        if (!current.ok) return this.customError(current.reason)

        const value = current.value
        let next: boolean

        if (value === undefined || value === null) next = true
        else if (typeof value === "boolean") next = !value
        else if (value === "true" || value === "false") next = value === "false"
        else return this.customError(`"${at}" is ${describe(value)}, not a boolean.`)

        const written = at.write(next)
        if (!written.ok) return this.customError(written.reason)

        return this.success()
    },
})
