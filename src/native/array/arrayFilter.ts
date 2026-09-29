import { Arg, ArgType, IExtendedCompiledFunctionConditionField, NativeFunction } from "@tryforge/forgescript"
import { testEach } from "../../functions/loop"
import { store } from "../../functions/source"

export default new NativeFunction({
    name: "$arrayFilter",
    version: "1.0.0",
    description: "Filters the elements of the array that pass a condition",
    unwrap: false,
    brackets: true,
    args: [
        Arg.requiredString("source", "The array, as a variable or JSON"),
        Arg.requiredString("variable", "The variable to load the element value to"),
        {
            ...Arg.requiredString("condition", "The condition"),
            condition: true,
        },
        Arg.optionalString("other variable", "The variable to load the result to, leave empty to return output"),
        Arg.optionalString("index variable", "The variable to load the element's index to"),
    ],
    output: ArgType.Json,
    async execute(ctx) {
        const condition = this.data.fields![2] as IExtendedCompiledFunctionConditionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3, 4)
        if (!this["isValidReturnType"](rt)) return rt
        const [source, variable, other, index] = args as [string, string, string | null, string | null]

        const out: unknown[] = []
        const stopped = await testEach(this, ctx, [source, variable, index], condition, (item) => void out.push(item))
        if (stopped) return stopped

        return store(this, ctx, other, out)
    },
})
