import { Arg, NativeFunction } from "@tryforge/forgescript"
import { mergeInto } from "../../functions/edit"
import { Location } from "../../structures/Location"
import { readRecord } from "../../functions/source"

const OBJECT = /^\s*\{/

function splitSources(rest: readonly string[]): [string[], string[]] {
    let start = rest.length - 1
    while (start > 0 && OBJECT.test(rest[start - 1])) start--

    return [rest.slice(0, start), rest.slice(start)]
}

export default new NativeFunction({
    name: "$objectMerge",
    version: "1.0.0",
    description: "Merges objects into another",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the object"),
        Arg.restString("keys;sources", "The keys to follow, then the objects to merge in", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, sources] = splitSources(rest)
        const incoming: Record<string, unknown>[] = []

        for (const source of sources) {
            const read = readRecord(ctx, source)
            if (!read.ok) return this.customError(read.reason)

            incoming.push(read.value)
        }

        const target = new Location(ctx, variable, keys).record()
        if (!target.ok) return this.customError(target.reason)

        for (const object of incoming) mergeInto(target.value, object)

        return this.success()
    },
})
