import type { Context } from "@tryforge/forgescript"
import { checkKeys, indexIn, isContainer, isRecord, readIn, readVariable, slotIn } from "../functions/location"
import { fail, ok, Result } from "../functions/result"
import { describe, looksLikeJSON, readJSON, shorten } from "../functions/value"

function spell(source: string, keys: readonly string[]) {
    return [looksLikeJSON(source) ? shorten(source) : source, ...keys].join(";")
}

export class Location {
    public constructor(
        private readonly ctx: Context,
        public readonly source: string,
        public readonly keys: readonly string[] = []
    ) {}

    public toString() {
        return spell(this.source, this.keys)
    }

    public read(): Result<unknown> {
        const checked = checkKeys(this.keys)
        if (!checked.ok) return checked

        const whole = this._readSource()
        if (!whole.ok) return whole

        return ok(readIn(whole.value, this.keys))
    }

    public write(value: unknown): Result<void> {
        const checked = this._writable()
        if (!checked.ok) return checked

        const { ctx, source: variable, keys } = this

        if (!keys.length) {
            ctx.setEnvironmentKey(variable, value)
            return ok(undefined)
        }

        let node = readVariable(ctx, variable)

        if (node === undefined || node === null) {
            node = {}
            ctx.setEnvironmentKey(variable, node)
        }

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const at = spell(variable, keys.slice(0, i))

            if (!isContainer(node)) return fail(`"${at}" is ${describe(node)}, it has no key "${key}".`)

            const container = node as Record<string, unknown>
            let slot: string | number = key

            if (Array.isArray(node)) {
                const index = slotIn(node, key, at)
                if (!index.ok) return index

                slot = index.value
            }

            if (i === keys.length - 1) {
                container[slot] = value
                return ok(undefined)
            }

            let child = Array.isArray(node) || Object.hasOwn(container, slot) ? container[slot] : undefined

            if (child === undefined || child === null) {
                child = {}
                container[slot] = child
            }

            node = child
        }

        return ok(undefined)
    }

    public delete(): Result<boolean> {
        const checked = this._writable()
        if (!checked.ok) return checked

        const { ctx, source: variable, keys } = this

        if (!keys.length) {
            const had = readVariable(ctx, variable) !== undefined
            ctx.deleteEnvironmentKey(variable)

            return ok(had)
        }

        const parent = readIn(readVariable(ctx, variable), keys.slice(0, -1))
        const key = keys[keys.length - 1]

        if (Array.isArray(parent)) {
            const index = indexIn(parent, key)
            if (index < 0 || index >= parent.length) return ok(false)

            parent.splice(index, 1)
            return ok(true)
        }

        if (!isRecord(parent) || !Object.hasOwn(parent, key)) return ok(false)

        return ok(delete parent[key])
    }

    public array(): Result<unknown[]>
    public array(options: { create: false }): Result<unknown[] | null>
    public array({ create = true }: { create?: boolean } = {}): Result<unknown[] | null> {
        const checked = this._writable()
        if (!checked.ok) return checked

        const read = this.read()
        if (!read.ok) return read

        if (Array.isArray(read.value)) return ok(read.value)
        if (read.value !== undefined && read.value !== null) {
            return fail(`"${this}" is ${describe(read.value)}, not an array.`)
        }

        if (!create) return ok(null)

        const created: unknown[] = []
        const written = this.write(created)

        return written.ok ? ok(created) : written
    }

    public record(): Result<Record<string, unknown>> {
        const checked = this._writable()
        if (!checked.ok) return checked

        const read = this.read()
        if (!read.ok) return read

        if (isRecord(read.value)) return ok(read.value)
        if (read.value !== undefined && read.value !== null) {
            return fail(`"${this}" is ${describe(read.value)}, not an object.`)
        }

        const created: Record<string, unknown> = {}
        const written = this.write(created)

        return written.ok ? ok(created) : written
    }

    private _readSource(): Result<unknown> {
        if (looksLikeJSON(this.source)) return readJSON(this.source)

        const name = checkKeys([this.source])
        if (!name.ok) return name

        return ok(readVariable(this.ctx, this.source))
    }

    private _writable(): Result<readonly string[]> {
        if (looksLikeJSON(this.source))
            return fail(`"${shorten(this.source)}" is JSON, only a variable can be written to.`)
        return checkKeys([this.source, ...this.keys])
    }
}
