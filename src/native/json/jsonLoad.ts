import { Arg, NativeFunction } from "@tryforge/forgescript"
import { Location } from "../../structures/Location"
import { ok } from "../../functions/result"
import { looksLikeJSON, parseScalar, readJSON } from "../../functions/value"

export default new NativeFunction({
    name: "$jsonLoad",
    version: "1.0.0",
    description: "Loads JSON to an environment variable",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The variable to load JSON to"), Arg.requiredString("json", "The JSON data")],
    execute(ctx, [variable, json]) {
        const parsed = looksLikeJSON(json) ? readJSON(json) : ok(json === "null" ? null : parseScalar(json))
        if (!parsed.ok) return this.customError(parsed.reason)

        const written = new Location(ctx, variable).write(parsed.value)
        if (!written.ok) return this.customError(written.reason)

        return this.success()
    },
})
