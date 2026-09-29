export function shuffle<T>(items: readonly T[], count = items.length): T[] {
    const out = [...items]
    const take = Math.min(Math.max(count, 0), out.length)

    for (let i = 0; i < take; i++) {
        const j = i + Math.floor(Math.random() * (out.length - i))
        ;[out[i], out[j]] = [out[j], out[i]]
    }

    return out.slice(0, take)
}
