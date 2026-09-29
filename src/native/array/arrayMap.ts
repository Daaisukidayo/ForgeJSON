import { Arg, ArgType, IExtendedCompiledFunctionField, NativeFunction, Return } from "@tryforge/forgescript"
import { eachElement } from "../../functions/loop"
import { store } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayMap",
    version: "1.0.0",
    description: "Maps through every element of the array",
    unwrap: false,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("variable", "The variable to load the element value to"),
        Arg.requiredString("code", "The code to execute for every element"),
        Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: ArgType.Json,
    async execute(ctx) {
        const code = this.data.fields![2] as IExtendedCompiledFunctionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3, 4)
        if (!this["isValidReturnType"](rt)) return rt
        const [source, variable, other, index] = args as [string, string, string | null, string | null]

        const out: unknown[] = []

        const stopped = await eachElement(this, ctx, [source, variable, index], async () => {
            const run: Return = await this["resolveCode"](ctx, code)

            if (run.return) out.push(parseValue(`${run.value ?? ""}`))
            else if (!run.success) return run
            else {
                const text = `${run.value ?? ""}`.trim()
                if (text) out.push(parseValue(text))
            }
        })

        return stopped ?? store(this, ctx, other, out)
    },
})
