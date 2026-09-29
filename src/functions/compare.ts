import { isContainer, isRecord, readIn } from "./location"
import { INTEGER } from "./loose"
import { numberOf, stringify } from "./value"

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (!isContainer(a) || !isContainer(b) || Array.isArray(a) !== Array.isArray(b)) return false

    if (Array.isArray(a)) {
        const other = b as unknown[]
        return a.length === other.length && a.every((item, i) => isEqual(item, other[i]))
    }

    const left = a as Record<string, unknown>
    const right = b as Record<string, unknown>
    const keys = Object.keys(left)

    return (
        keys.length === Object.keys(right).length &&
        keys.every((key) => Object.hasOwn(right, key) && isEqual(left[key], right[key]))
    )
}

export function canonical(value: unknown): string {
    return stringify(sortKeys(value)) ?? "undefined"
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortKeys)
    if (!isRecord(value)) return value

    return Object.fromEntries(
        Object.keys(value)
            .sort()
            .map((key) => [key, sortKeys(value[key])])
    )
}

type SortKey =
    | { rank: 0; num: number; big: bigint | null }
    | { rank: 1; text: string }
    | { rank: 2; bool: boolean }
    | { rank: 3; text: string }

function sortKey(value: unknown): SortKey {
    const num = numberOf(value)

    if (num !== undefined) {
        const text = String(value).trim()
        return { rank: 0, num, big: INTEGER.test(text) ? BigInt(text) : null }
    }

    if (typeof value === "string") return { rank: 1, text: value }
    if (typeof value === "boolean") return { rank: 2, bool: value }

    return { rank: 3, text: canonical(value) }
}

function compareKeys(a: SortKey, b: SortKey): number {
    if (a.rank !== b.rank) return a.rank - b.rank

    if (a.rank === 0 && b.rank === 0) {
        if (a.big !== null && b.big !== null) return a.big < b.big ? -1 : a.big > b.big ? 1 : 0
        return a.num - b.num
    }

    if (a.rank === 2 && b.rank === 2) return Number(a.bool) - Number(b.bool)

    return collator.compare((a as { text: string }).text, (b as { text: string }).text)
}

const isEmpty = (value: unknown) => value === undefined || value === null

export function sortBy(items: readonly unknown[], keys: readonly string[], descending: boolean) {
    const direction = descending ? -1 : 1

    return items
        .map((item) => {
            const value = readIn(item, keys)
            return { item, empty: isEmpty(value), key: isEmpty(value) ? null : sortKey(value) }
        })
        .sort((a, b) => {
            if (a.empty || b.empty) return Number(a.empty) - Number(b.empty)
            return compareKeys(a.key!, b.key!) * direction
        })
        .map(({ item }) => item)
}

export function numbersIn(items: readonly unknown[], keys: readonly string[]) {
    const out: number[] = []

    for (const item of items) {
        const number = numberOf(readIn(item, keys))
        if (number !== undefined) out.push(number)
    }

    return out
}
