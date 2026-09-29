"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEGER = void 0;
exports.parseLoose = parseLoose;
const result_1 = require("./result");
const BARE_WORD = /[\p{L}\p{N}_$]+/uy;
const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
exports.INTEGER = /^-?\d+$/;
const SPACE = /\s*/y;
const HEX = /^[0-9a-fA-F]{4}$/;
const ESCAPES = {
    '"': '"',
    "'": "'",
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
};
const LITERALS = { true: true, false: false, null: null };
class Unreadable extends Error {
}
class LooseReader {
    text;
    at = 0;
    constructor(text) {
        this.text = text;
    }
    read() {
        const value = this.value();
        this.space();
        if (this.at < this.text.length)
            this.fail("there is more after the value");
        return value;
    }
    value() {
        this.space();
        const char = this.text[this.at];
        if (char === "{")
            return this.object();
        if (char === "[")
            return this.array();
        if (char === '"' || char === "'")
            return this.string();
        if (char === "-" || (char >= "0" && char <= "9"))
            return this.number();
        const word = this.match(BARE_WORD);
        if (word === null)
            this.fail("expected a value");
        if (!Object.hasOwn(LITERALS, word))
            this.fail(`${word} is not a value, text goes in quotes`, null);
        this.at += word.length;
        return LITERALS[word];
    }
    object() {
        const object = {};
        this.at++;
        this.space();
        while (this.text[this.at] !== "}") {
            const key = this.key();
            this.space();
            if (this.text[this.at] !== ":")
                this.fail("expected : after a key, and a key with spaces goes in quotes");
            this.at++;
            Object.defineProperty(object, key, {
                value: this.value(),
                enumerable: true,
                writable: true,
                configurable: true,
            });
            this.space();
            if (this.text[this.at] === ",") {
                this.at++;
                this.space();
            }
            else if (this.text[this.at] !== "}") {
                this.fail("expected , or }");
            }
        }
        this.at++;
        return object;
    }
    array() {
        const array = [];
        this.at++;
        this.space();
        while (this.text[this.at] !== "]") {
            array.push(this.value());
            this.space();
            if (this.text[this.at] === ",") {
                this.at++;
                this.space();
            }
            else if (this.text[this.at] !== "]") {
                this.fail("expected , or ]");
            }
        }
        this.at++;
        return array;
    }
    key() {
        const char = this.text[this.at];
        if (char === '"' || char === "'")
            return this.string();
        const word = this.match(BARE_WORD);
        if (word === null)
            this.fail("expected a key");
        this.at += word.length;
        return word;
    }
    string() {
        const quote = this.text[this.at];
        const start = this.at;
        let text = "";
        this.at++;
        while (true) {
            const char = this.text[this.at];
            if (char === undefined)
                this.fail("the quotes are never closed", start);
            if (char === quote)
                break;
            if (char === "\\") {
                text += this.escape();
            }
            else if (char < " ") {
                this.fail("a line break or tab inside quotes has to be escaped");
            }
            else {
                text += char;
                this.at++;
            }
        }
        this.at++;
        return text;
    }
    escape() {
        const next = this.text[this.at + 1];
        if (next === "u") {
            const hex = this.text.slice(this.at + 2, this.at + 6);
            if (!HEX.test(hex))
                this.fail("expected four hex digits in the escape");
            this.at += 6;
            return String.fromCharCode(Number.parseInt(hex, 16));
        }
        if (next === undefined || !Object.hasOwn(ESCAPES, next))
            this.fail("not an escape");
        this.at += 2;
        return ESCAPES[next];
    }
    number() {
        const digits = this.match(NUMBER);
        if (digits === null)
            this.fail("expected a value");
        this.at += digits.length;
        const value = Number(digits);
        return Number.isSafeInteger(value) || !exports.INTEGER.test(digits) ? value : digits;
    }
    space() {
        this.at += this.match(SPACE)?.length ?? 0;
    }
    match(pattern) {
        pattern.lastIndex = this.at;
        return pattern.exec(this.text)?.[0] ?? null;
    }
    fail(reason, at = this.at) {
        if (at === null)
            throw new Unreadable(reason);
        const rest = this.text.slice(at);
        const place = !rest ? "the end" : rest.length > 30 ? `"${rest.slice(0, 27)}..."` : `"${rest}"`;
        throw new Unreadable(`${reason} at ${place}`);
    }
}
function parseLoose(text) {
    try {
        return (0, result_1.ok)(new LooseReader(text).read());
    }
    catch (err) {
        if (err instanceof Unreadable)
            return (0, result_1.fail)(err.message);
        if (err instanceof RangeError)
            return (0, result_1.fail)("it is nested too deep");
        throw err;
    }
}
//# sourceMappingURL=loose.js.map