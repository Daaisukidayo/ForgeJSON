import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { FORBIDDEN_KEYS } from "../../functions/location"
import { answer } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$objectOf",
    version: "1.0.0",
    description: "Creates an object from keys and values",
    unwrap: true,
    brackets: false,
    args: [Arg.restString("pairs", "The keys and values, in pairs")],
    output: ArgType.Json,
    execute(ctx, [pairs]) {
        const given = pairs ?? []

        if (given.length % 2) {
            return this.customError(`Every key needs a value, and "${given.at(-1)}" was left without one.`)
        }

        const out: Record<string, unknown> = {}

        for (let i = 0; i < given.length; i += 2) {
            const key = given[i]

            if (FORBIDDEN_KEYS.has(key)) {
                return this.customError(`"${key}" can't be used as a key, it leads to the prototype.`)
            }

            out[key] = parseValue(given[i + 1])
        }

        return answer(this, out)
    },
})
