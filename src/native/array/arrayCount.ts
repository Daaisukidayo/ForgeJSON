import { Arg, ArgType, IExtendedCompiledFunctionConditionField, NativeFunction } from "@tryforge/forgescript"
import { testEach } from "../../functions/loop"

export default new NativeFunction({
    name: "$arrayCount",
    version: "1.0.0",
    description: "Counts the elements of the array that pass a condition",
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
    output: ArgType.Number,
    async execute(ctx) {
        const condition = this.data.fields![2] as IExtendedCompiledFunctionConditionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt
        const [source, variable, index] = args as [string, string, string | null]

        let count = 0

        const stopped = await testEach(this, ctx, [source, variable, index], condition, () => void count++)
        if (stopped) return stopped

        return this.success(count)
    },
})
