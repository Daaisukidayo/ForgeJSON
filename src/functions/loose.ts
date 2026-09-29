import { fail, ok, Result } from "./result"

const BARE_WORD = /[\p{L}\p{N}_$]+/uy

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y

export const INTEGER = /^-?\d+$/

const SPACE = /\s*/y

const HEX = /^[0-9a-fA-F]{4}$/

const ESCAPES: Record<string, string> = {
    '"': '"',
    "'": "'",
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
}

const LITERALS: Record<string, unknown> = { true: true, false: false, null: null }

class Unreadable extends Error {}

class LooseReader {
    private at = 0

    public constructor(private readonly text: string) {}

    public read() {
        const value = this.value()
        this.space()
        if (this.at < this.text.length) this.fail("there is more after the value")

        return value
    }

    private value(): unknown {
        this.space()
        const char = this.text[this.at]

        if (char === "{") return this.object()
        if (char === "[") return this.array()
        if (char === '"' || char === "'") return this.string()
        if (char === "-" || (char >= "0" && char <= "9")) return this.number()

        const word = this.match(BARE_WORD)
        if (word === null) this.fail("expected a value")
        if (!Object.hasOwn(LITERALS, word)) this.fail(`${word} is not a value, text goes in quotes`, null)

        this.at += word.length
        return LITERALS[word]
    }

    private object() {
        const object: Record<string, unknown> = {}
        this.at++
        this.space()

        while (this.text[this.at] !== "}") {
            const key = this.key()
            this.space()

            if (this.text[this.at] !== ":") this.fail("expected : after a key, and a key with spaces goes in quotes")
            this.at++

            Object.defineProperty(object, key, {
                value: this.value(),
                enumerable: true,
                writable: true,
                configurable: true,
            })
            this.space()

            if (this.text[this.at] === ",") {
                this.at++
                this.space()
            } else if (this.text[this.at] !== "}") {
                this.fail("expected , or }")
            }
        }

        this.at++
        return object
    }

    private array() {
        const array: unknown[] = []
        this.at++
        this.space()

        while (this.text[this.at] !== "]") {
            array.push(this.value())
            this.space()

            if (this.text[this.at] === ",") {
                this.at++
                this.space()
            } else if (this.text[this.at] !== "]") {
                this.fail("expected , or ]")
            }
        }

        this.at++
        return array
    }

    private key() {
        const char = this.text[this.at]
        if (char === '"' || char === "'") return this.string()

        const word = this.match(BARE_WORD)
        if (word === null) this.fail("expected a key")

        this.at += word.length
        return word
    }

    private string() {
        const quote = this.text[this.at]
        const start = this.at
        let text = ""
        this.at++

        while (true) {
            const char = this.text[this.at]

            if (char === undefined) this.fail("the quotes are never closed", start)
            if (char === quote) break

            if (char === "\\") {
                text += this.escape()
            } else if (char < " ") {
                this.fail("a line break or tab inside quotes has to be escaped")
            } else {
                text += char
                this.at++
            }
        }

        this.at++
        return text
    }

    private escape() {
        const next = this.text[this.at + 1]

        if (next === "u") {
            const hex = this.text.slice(this.at + 2, this.at + 6)
            if (!HEX.test(hex)) this.fail("expected four hex digits in the escape")

            this.at += 6
            return String.fromCharCode(Number.parseInt(hex, 16))
        }

        if (next === undefined || !Object.hasOwn(ESCAPES, next)) this.fail("not an escape")

        this.at += 2
        return ESCAPES[next]
    }

    private number() {
        const digits = this.match(NUMBER)
        if (digits === null) this.fail("expected a value")

        this.at += digits.length
        const value = Number(digits)

        return Number.isSafeInteger(value) || !INTEGER.test(digits) ? value : digits
    }

    private space() {
        this.at += this.match(SPACE)?.length ?? 0
    }

    private match(pattern: RegExp) {
        pattern.lastIndex = this.at
        return pattern.exec(this.text)?.[0] ?? null
    }

    private fail(reason: string, at: number | null = this.at): never {
        if (at === null) throw new Unreadable(reason)

        const rest = this.text.slice(at)
        const place = !rest ? "the end" : rest.length > 30 ? `"${rest.slice(0, 27)}..."` : `"${rest}"`

        throw new Unreadable(`${reason} at ${place}`)
    }
}

export function parseLoose(text: string): Result<unknown> {
    try {
        return ok(new LooseReader(text).read())
    } catch (err) {
        if (err instanceof Unreadable) return fail(err.message)

        if (err instanceof RangeError) return fail("it is nested too deep")

        throw err
    }
}
