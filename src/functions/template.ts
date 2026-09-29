import { FORBIDDEN_KEYS, readIn } from "./location"
import { toText } from "./value"

type Part = { text: string } | { keys: string[] } | { position: true } | { self: true }

function readPlaceholder(inside: string): string[] | null {
    const keys: string[] = []
    let key = ""

    for (let i = 0; i < inside.length; i++) {
        const char = inside[i]

        if (char === "\\" && i + 1 < inside.length) key += inside[++i]
        else if (char === ".") {
            keys.push(key)
            key = ""
        } else key += char
    }

    keys.push(key)

    if (keys.includes("") || keys.some((one) => FORBIDDEN_KEYS.has(one))) return null

    return keys
}

export function parseTemplate(template: string): Part[] {
    const parts: Part[] = []
    let text = ""

    for (let i = 0; i < template.length; i++) {
        const char = template[i]
        const next = template[i + 1]

        if ((char === "{" && next === "{") || (char === "}" && next === "}")) {
            text += char
            i++
            continue
        }

        const end = char === "{" ? template.indexOf("}", i + 1) : -1
        const inside = end === -1 ? "" : template.slice(i + 1, end)
        const special = inside === "#" ? { position: true as const } : inside === "." ? { self: true as const } : null
        const keys = special || !inside ? null : readPlaceholder(inside)

        if (!special && !keys) {
            text += char
            continue
        }

        if (text) parts.push({ text })
        parts.push(special ?? { keys: keys! })

        text = ""
        i = end
    }

    if (text) parts.push({ text })

    return parts
}

export function fill(parts: readonly Part[], element: unknown, position: number) {
    let out = ""

    for (const part of parts) {
        if ("text" in part) out += part.text
        else if ("position" in part) out += position
        else if ("self" in part) out += shown(element)
        else out += shown(readIn(element, part.keys))
    }

    return out
}

const shown = (value: unknown) => (value === null ? "" : (toText(value) ?? ""))
