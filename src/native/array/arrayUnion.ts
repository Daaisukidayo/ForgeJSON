import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { canonical } from "../../functions/compare"
import { answer, readArray } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayUnion",
    version: "1.0.0",
    description: "Combines arrays without repeats",
    unwrap: true,
    brackets: true,
    args: [Arg.restString("sources", "The arrays, each a variable or JSON", true)],
    output: ArgType.Json,
    execute(ctx, [sources]) {
        const seen = new Set<string>()
        const out: unknown[] = []

        for (const source of sources) {
            const list = readArray(ctx, source)
            if (!list.ok) return this.customError(list.reason)

            for (const item of list.value) {
                const id = canonical(item)
                if (seen.has(id)) continue

                seen.add(id)
                out.push(item)
            }
        }

        return answer(this, out)
    },
})
