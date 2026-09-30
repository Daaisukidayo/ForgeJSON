import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { answer } from "../../functions/source"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$arraySplice",
    version: "1.1.0",
    description: "Removes elements from an array and inserts new ones, returns the removed elements",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the array"),
        Arg.requiredNumber("index", "The index to start at"),
        Arg.requiredNumber("delete count", "The number of elements to remove"),
        Arg.restString("elements", "The elements to insert"),
    ],
    output: ArgType.Json,
    execute(ctx, [variable, index, count, elements]) {
        const list = new Location(ctx, variable).array()
        if (!list.ok) return this.customError(list.reason)

        return answer(this, list.value.splice(index, count, ...elements.map(parseValue)))
    },
})
