import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isContainer } from "../../functions/location"
import { Location } from "../../structures/Location"
import { answer } from "../../functions/source"
import { describe } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonEntries",
    version: "1.1.0",
    description: "Gets entries from JSON",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("source", "The variable, or JSON"), Arg.restString("keys", "The keys to follow")],
    output: ArgType.Json,
    execute(ctx, [source, keys]) {
        const at = new Location(ctx, source, keys)
        const read = at.read()
        if (!read.ok) return this.customError(read.reason)

        const value = read.value
        if (value !== undefined && value !== null && !isContainer(value)) {
            return this.customError(`"${at}" is ${describe(value)}, it has no entries.`)
        }

        return answer(this, isContainer(value) ? Object.entries(value) : [])
    },
})
