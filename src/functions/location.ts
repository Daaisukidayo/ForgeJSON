import type { Context } from "@tryforge/forgescript"
import { fail, ok, Result } from "./result"

export const FORBIDDEN_KEYS: ReadonlySet<string> = new Set(["__proto__", "prototype", "constructor"])

const INDEX = /^(?:0|[1-9]\d*)$/

const FROM_END = /^-[1-9]\d*$/

export function isContainer(value: unknown): value is object {
    return typeof value === "object" && value !== null
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return isContainer(value) && !Array.isArray(value)
}

export function checkKeys(keys: readonly string[]): Result<readonly string[]> {
    const forbidden = keys.find((key) => FORBIDDEN_KEYS.has(key))
    if (forbidden !== undefined) return fail(`"${forbidden}" can't be used as a key, it leads to the prototype.`)

    return ok(keys)
}

export function splitLast(rest: readonly string[]): [string[], string] {
    return [rest.slice(0, -1), rest[rest.length - 1]]
}

export function indexIn(array: readonly unknown[], key: string) {
    if (INDEX.test(key)) return Number(key)
    if (FROM_END.test(key)) return array.length + Number(key)

    return -1
}

export function childOf(value: unknown, key: string): unknown {
    if (Array.isArray(value)) {
        const index = indexIn(value, key)
        return index < 0 ? undefined : value[index]
    }

    if (isRecord(value) && Object.hasOwn(value, key)) return value[key]

    return undefined
}

export function readIn(value: unknown, keys: readonly string[]): unknown {
    for (const key of keys) {
        value = childOf(value, key)
        if (value === undefined) return undefined
    }

    return value
}

export function readVariable(ctx: Context, name: string): unknown {
    const value = ctx.getEnvironmentKey(name)
    return typeof value === "function" ? undefined : value
}

export function slotIn(array: unknown[], key: string, at: string): Result<number> {
    if (INDEX.test(key)) {
        if (Number(key) > array.length) {
            return fail(`"${at}" has ${array.length} element(s), index ${key} is past its end.`)
        }

        return ok(Number(key))
    }

    if (FROM_END.test(key)) {
        const index = array.length + Number(key)
        if (index < 0) return fail(`"${at}" has ${array.length} element(s), index ${key} is before its start.`)

        return ok(index)
    }

    return fail(`"${at}" is an array, and "${key}" is not an index.`)
}
