import { INTEGER, parseLoose } from "./loose"
import { fail, ok, Result } from "./result"

const JSON_START = /^\s*[[{]/

const LONG_DIGITS = /\d{16,}/

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i

export function looksLikeJSON(text: string) {
    return JSON_START.test(text)
}

export function parseJSON(text: string): Result<unknown> {
    try {
        return ok(LONG_DIGITS.test(text) ? JSON.parse(text, keepLongIntegers) : JSON.parse(text))
    } catch (err) {
        return fail(err instanceof Error ? err.message : String(err))
    }
}

function keepLongIntegers(_key: string, value: unknown, context?: { source?: string }) {
    if (typeof value === "number" && !Number.isSafeInteger(value) && context?.source && INTEGER.test(context.source)) {
        return context.source
    }

    return value
}

export function readJSON(text: string): Result<unknown> {
    const parsed = parseJSON(text)
    if (parsed.ok) return parsed

    const loose = parseLoose(text).ok
        ? " It is written the JavaScript way: put the keys and text in double quotes, or turn it into JSON with $jsonStringify."
        : ""

    return fail(`${preview(text)} is not valid JSON: ${parsed.reason}.${cutHint(text)}${loose}`)
}

export function readValue(text: string): Result<unknown> {
    if (looksLikeJSON(text)) return readJSON(text)

    return ok(text === "null" ? null : parseScalar(text))
}

export function readValues(texts: readonly string[]): Result<unknown[]> {
    const values: unknown[] = []

    for (const text of texts) {
        const read = readValue(text)
        if (!read.ok) return read

        values.push(read.value)
    }

    return ok(values)
}

export function readLooseJSON(text: string): Result<unknown> {
    const parsed = parseJSON(text)
    if (parsed.ok) return parsed

    const loose = parseLoose(text)
    if (loose.ok) return loose

    return fail(`${preview(text)} is not valid JSON: ${loose.reason}.${cutHint(text)}`)
}

export function cutHint(text: string) {
    return count(text, "[") > count(text, "]")
        ? " A ] ends an argument early: put a backslash before it, two in a command file, or build the value with $arrayOf."
        : ""
}

export function parseValue(text: string): unknown {
    if (text === "null") return null

    if (looksLikeJSON(text)) {
        const parsed = parseJSON(text)
        if (parsed.ok) return parsed.value
    }

    return parseScalar(text)
}

export function parseScalar(text: string): unknown {
    if (text.length > 1 && text.startsWith('"') && text.endsWith('"')) {
        const parsed = parseJSON(text)
        return parsed.ok && typeof parsed.value === "string" ? parsed.value : text.slice(1, -1)
    }

    if (text === "true") return true
    if (text === "false") return false

    const number = Number(text)
    if (Number.isFinite(number) && String(number) === text) return number

    return text
}

export function stringify(value: unknown, indent?: number): string {
    return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), indent)
}

export function toText(value: unknown): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === "string") return value
    if (typeof value === "object") return stringify(value)

    return String(value)
}

export function joinTexts(values: readonly unknown[], separator: string) {
    return values.map((value) => (value === null ? "" : (toText(value) ?? ""))).join(separator)
}

export function typeOf(value: unknown) {
    if (value === null) return "null"
    if (Array.isArray(value)) return "array"

    return typeof value
}

export function describe(value: unknown) {
    const type = typeOf(value)
    if (type === "undefined") return "nothing"
    if (type === "null") return "null"

    return `${/^[aeiou]/.test(type) ? "an" : "a"} ${type}`
}

export function numberOf(value: unknown): number | undefined {
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined
    if (typeof value !== "string") return undefined

    const text = value.trim()
    if (!DECIMAL.test(text)) return undefined

    const number = Number(text)
    return Number.isFinite(number) ? number : undefined
}

export function tidy(value: number) {
    return Number.isInteger(value) ? value : Number.parseFloat(value.toPrecision(15))
}

export function shorten(text: string) {
    return text.length > 60 ? `${text.slice(0, 57)}...` : text
}

export function preview(text: string) {
    return `"${shorten(text)}"`
}

function count(text: string, char: string) {
    return text.split(char).length - 1
}
