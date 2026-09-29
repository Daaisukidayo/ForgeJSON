import { Arg, ArgType, IExtendedCompiledFunctionConditionField, NativeFunction } from "@tryforge/forgescript"
import { testEach } from "../../functions/loop"

export default new NativeFunction({
    name: "$arraySome",
    version: "1.0.0",
    description: "Checks whether any element of the array passes a condition, returns bool",
    unwrap: false,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("variable", "The variable to load the element value to"),
        {
            ...Arg.requiredString("condition", "The condition"),
            condition: true,
        },
        Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: ArgType.Boolean,
    async execute(ctx) {
        const condition = this.data.fields![2] as IExtendedCompiledFunctionConditionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt
        const [source, variable, index] = args as [string, string, string | null]

        let any = false

        const stopped = await testEach(this, ctx, [source, variable, index], condition, () => {
            any = true
            return true
        })

        if (stopped) return stopped

        return this.success(any)
    },
})
