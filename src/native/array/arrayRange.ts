import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer } from "../../functions/source"
import { tidy } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayRange",
    version: "1.0.0",
    description: "Creates an array of numbers from start to end",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredNumber("start", "The first number"),
        Arg.requiredNumber("end", "The last number"),
        Arg.optionalNumber("step", "The step between numbers"),
    ],
    output: ArgType.Json,
    execute(ctx, [start, end, step]) {
        const by = typeof step === "number" ? step : start <= end ? 1 : -1
        if (by === 0) return this.customError("A step of 0 never reaches the end.")

        if (Math.sign(end - start) === -Math.sign(by)) return answer(this, [])

        const count = Math.floor(tidy((end - start) / by)) + 1

        return answer(
            this,
            Array.from({ length: count }, (_, i) => tidy(start + i * by))
        )
    },
})
