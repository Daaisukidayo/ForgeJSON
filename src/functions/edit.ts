import { FORBIDDEN_KEYS, isRecord } from "./location"

export function copy(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(copy)
    if (!isRecord(value)) return value

    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value)) if (!FORBIDDEN_KEYS.has(key)) out[key] = copy(value[key])

    return out
}

export function mergeInto(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const key of Object.keys(source)) {
        if (FORBIDDEN_KEYS.has(key)) continue

        const current = Object.hasOwn(target, key) ? target[key] : undefined
        const incoming = source[key]

        if (isRecord(current) && isRecord(incoming)) mergeInto(current, incoming)
        else target[key] = copy(incoming)
    }
}

export function defaultsInto(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const key of Object.keys(source)) {
        if (FORBIDDEN_KEYS.has(key)) continue

        const current = Object.hasOwn(target, key) ? target[key] : undefined
        const incoming = source[key]

        if (current === undefined || current === null) target[key] = copy(incoming)
        else if (isRecord(current) && isRecord(incoming)) defaultsInto(current, incoming)
    }
}
