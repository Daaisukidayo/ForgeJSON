import { Arg, NativeFunction } from "@tryforge/forgescript"
import { splitLast } from "../../functions/location"
import { Location } from "../../structures/Location"
import { describe, numberOf, tidy } from "../../functions/value"

const OPERATORS = {
    "*": (value: number, amount: number) => value * amount,
    "/": (value: number, amount: number) => value / amount,
    "%": (value: number, amount: number) => value % amount,
}

export default new NativeFunction({
    name: "$jsonMath",
    version: "1.0.0",
    description: "Does math on a number in JSON",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable that holds the number"),
        Arg.restString("keys;amount", "The keys to follow, then the amount", true),
    ],
    execute(ctx, [variable, rest]) {
        const [keys, text] = splitLast(rest)
        const trimmed = text.trim()
        const sign = trimmed.charAt(0)
        const operate = Object.hasOwn(OPERATORS, sign) ? OPERATORS[sign as keyof typeof OPERATORS] : null
        const amount = numberOf(operate ? trimmed.slice(1) : trimmed)

        if (amount === undefined) {
            return this.customError(`"${text}" is not an amount. Write a number to add, or *, / or % and a number.`)
        }

        if (operate && sign !== "*" && amount === 0) return this.customError(`"${text}" divides by 0.`)

        const at = new Location(ctx, variable, keys)
        const current = at.read()
        if (!current.ok) return this.customError(current.reason)

        const value = current.value
        const base = value === undefined || value === null ? 0 : numberOf(value)

        if (base === undefined) {
            return this.customError(`"${at}" is ${describe(value)}, not a number.`)
        }

        const next = tidy(operate ? operate(base, amount) : base + amount)

        if (!Number.isFinite(next) || (Number.isInteger(next) && !Number.isSafeInteger(next))) {
            return this.customError(`"${at}" would become ${next}, too large to hold exactly.`)
        }

        const written = at.write(next)
        if (!written.ok) return this.customError(written.reason)

        return this.success()
    },
})
