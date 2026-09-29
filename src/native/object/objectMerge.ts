import { Arg, NativeFunction } from "@tryforge/forgescript"
import { mergeInto } from "../../functions/edit"
import { splitLast } from "../../functions/location"
import { Location } from "../../structures/Location"
import { readRecord } from "../../functions/source"

export default new NativeFunction({
    name: "$objectMerge",
    version: "1.0.0",
    description: "Merges an object into another",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the object"),
        Arg.restString("keys;source", "The keys to follow, then the object to merge in, as a variable or JSON", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, source] = splitLast(rest)

        const incoming = readRecord(ctx, source)
        if (!incoming.ok) return this.customError(incoming.reason)

        const target = new Location(ctx, variable, keys).record()
        if (!target.ok) return this.customError(target.reason)

        mergeInto(target.value, incoming.value)

        return this.success()
    },
})
