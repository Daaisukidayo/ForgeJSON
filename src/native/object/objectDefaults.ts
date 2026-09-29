import { Arg, NativeFunction } from "@tryforge/forgescript"
import { defaultsInto } from "../../functions/edit"
import { splitLast } from "../../functions/location"
import { Location } from "../../structures/Location"
import { readRecord } from "../../functions/source"

export default new NativeFunction({
    name: "$objectDefaults",
    version: "1.0.0",
    description: "Fills the missing keys of an object with defaults",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the object"),
        Arg.restString("keys;defaults", "The keys to follow, then the defaults, as a variable or JSON", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, source] = splitLast(rest)

        const defaults = readRecord(ctx, source)
        if (!defaults.ok) return this.customError(defaults.reason)

        const target = new Location(ctx, variable, keys).record()
        if (!target.ok) return this.customError(target.reason)

        defaultsInto(target.value, defaults.value)

        return this.success()
    },
})
