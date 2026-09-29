import type { CompiledFunction, Context } from "@tryforge/forgescript"
import { Location } from "../structures/Location"
import { checkKeys, isRecord } from "./location"
import { fail, ok, Result } from "./result"
import { describe, looksLikeJSON, preview, toText } from "./value"

type Answerer = Pick<CompiledFunction, "success" | "customError">

export function readArray(ctx: Context, source: string): Result<unknown[]> {
    const read = new Location(ctx, source).read()
    if (!read.ok) return read

    if (read.value === undefined || read.value === null) return ok([])
    if (!Array.isArray(read.value)) return fail(`${label(source)} is ${describe(read.value)}, not an array.`)

    return ok(read.value)
}

export function readRecord(ctx: Context, source: string): Result<Record<string, unknown>> {
    const read = new Location(ctx, source).read()
    if (!read.ok) return read

    if (read.value === undefined || read.value === null) return ok({})
    if (!isRecord(read.value)) return fail(`${label(source)} is ${describe(read.value)}, not an object.`)

    return ok(read.value)
}

export function label(source: string) {
    return looksLikeJSON(source) ? preview(source) : `"${source}"`
}

export function answer(fn: Pick<CompiledFunction, "success">, value: unknown) {
    return fn.success(toText(value) ?? null)
}

export function store(fn: Answerer, ctx: Context, variable: string | null, value: unknown) {
    if (!variable) return answer(fn, value)

    const name = checkKeys([variable])
    if (!name.ok) return fn.customError(name.reason)

    ctx.setEnvironmentKey(variable, value)
    return fn.success()
}
