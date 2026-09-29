import { Arg, IExtendedCompiledFunctionField, NativeFunction, Return } from "@tryforge/forgescript"
import { eachElement } from "../../functions/loop"

export default new NativeFunction({
    name: "$arrayForEach",
    version: "1.0.0",
    description: "Loops through every element of the array",
    unwrap: false,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("variable", "The variable to load the element value to"),
        Arg.requiredString("code", "The code to execute for every element"),
        Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    async execute(ctx) {
        const code = this.data.fields![2] as IExtendedCompiledFunctionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt

        const stopped = await eachElement(this, ctx, args as [string, string, string | null], async () => {
            const run: Return = await this["resolveCode"](ctx, code)
            if (!run.success) return run
        })

        return stopped ?? this.success()
    },
})
