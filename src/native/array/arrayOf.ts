import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { answer } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arrayOf",
    version: "1.0.0",
    description: "Creates an array from values",
    unwrap: true,
    brackets: false,
    args: [Arg.restString("values", "The elements of the array")],
    output: ArgType.Json,
    execute(ctx, [values]) {
        return answer(this, (values ?? []).map(parseValue))
    },
})
