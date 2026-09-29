import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { checkKeys, readIn } from "../../functions/location"
import { answer, readArray } from "../../functions/source"
import { numberOf } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayWeightedRandom",
    version: "1.0.0",
    description: "Picks a random element by weight",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.restString("key", "The key with the weight", true),
    ],
    output: ArgType.Unknown,
    execute(ctx, [source, keys]) {
        const checked = checkKeys(keys)
        if (!checked.ok) return this.customError(checked.reason)

        const list = readArray(ctx, source)
        if (!list.ok) return this.customError(list.reason)

        const weights = list.value.map((item) => Math.max(numberOf(readIn(item, keys)) ?? 0, 0))
        const total = weights.reduce((sum, weight) => sum + weight, 0)

        if (total <= 0) return this.success()

        let roll = Math.random() * total
        let last = -1

        for (let i = 0; i < weights.length; i++) {
            if (weights[i] <= 0) continue

            roll -= weights[i]
            last = i

            if (roll < 0) return answer(this, list.value[i])
        }

        return answer(this, list.value[last])
    },
})
