import { Arg, ArgType, IExtendedCompiledFunctionField, NativeFunction, Return } from "@tryforge/forgescript"
import { checkKeys, readVariable } from "../../functions/location"
import { borrow, eachElement } from "../../functions/loop"
import { answer } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayReduce",
    version: "1.0.0",
    description: "Reduces an array to a single value",
    unwrap: false,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("variable", "The variable to load the carried value to"),
        Arg.requiredString("other variable", "The variable to load the element value to"),
        Arg.requiredString("code", "The code to execute for every element"),
        Arg.optionalString("default value", "The value to start from"),
        Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: ArgType.Unknown,
    async execute(ctx) {
        const code = this.data.fields![3] as IExtendedCompiledFunctionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 2, 4, 5)
        if (!this["isValidReturnType"](rt)) return rt
        const [source, carried, variable, start, index] = args as [string, string, string, string | null, string | null]

        if (!carried) return this.customError("The loop needs a variable to carry the value in.")

        const kept = checkKeys([carried])
        if (!kept.ok) return this.customError(kept.reason)

        const carry = (value: unknown) => ctx.setEnvironmentKey(carried, value)
        const giveBack = borrow(ctx, [carried])

        try {
            carry(start ? parseValue(start) : 0)

            const stopped = await eachElement(this, ctx, [source, variable, index], async () => {
                const run: Return = await this["resolveCode"](ctx, code)

                if (run.return) carry(parseValue(`${run.value ?? ""}`))
                else if (!run.success) return run
                else {
                    const text = `${run.value ?? ""}`.trim()
                    if (text) carry(parseValue(text))
                }
            })

            return stopped ?? answer(this, readVariable(ctx, carried))
        } finally {
            giveBack()
        }
    },
})
