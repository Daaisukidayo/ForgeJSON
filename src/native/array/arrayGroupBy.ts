import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { checkKeys, readIn } from "../../functions/location"
import { answer, readArray } from "../../functions/source"
import { toText } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayGroupBy",
    version: "1.0.0",
    description: "Groups the elements of the array by a key",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.restString("key", "The key to group by", true),
    ],
    output: ArgType.Json,
    execute(ctx, [source, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const groups = new Map<string, unknown[]>()

        for (const item of list.value) {
            const name = toText(readIn(item, keys)) ?? ""
            const group = groups.get(name)

            if (group) group.push(item)
            else groups.set(name, [item])
        }

        return answer(this, Object.fromEntries(groups))
    },
})
