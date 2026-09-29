import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { checkKeys } from "../functions/location"
import { fill, parseTemplate } from "../functions/template"
import { parseLoose } from "../functions/loose"
import { numberOf, parseJSON, parseValue, readJSON } from "../functions/value"

describe("a number stored as text", () => {
    it("counts only when written in decimals", () => {
        assert.equal(numberOf(" 5 "), 5)
        assert.equal(numberOf("1e3"), 1000)
        assert.equal(numberOf("-.5"), -0.5)
        assert.equal(numberOf("007"), 7)

        for (const text of ["0x10", "0b11", "0o7", "Infinity", "NaN", "", " ", "5 apples", "1e400"]) {
            assert.equal(numberOf(text), undefined, text)
        }
    })
})

describe("a typed value", () => {
    it("becomes a number only when the number prints back as typed", () => {
        assert.equal(parseValue("123"), 123)
        assert.equal(parseValue("-5"), -5)
        assert.equal(parseValue("0.1"), 0.1)

        for (const text of ["007", "1.50", "1e3", "-0", "0x10", " 5", "Infinity", "NaN", ""]) {
            assert.equal(parseValue(text), text, `"${text}" would not come back the same as a number`)
        }
    })

    it("keeps an ID as text", () => {
        assert.equal(parseValue("123456789012345678"), "123456789012345678")
        assert.equal(parseValue("9007199254740993"), "9007199254740993", "one past the largest exact integer")
        assert.equal(parseValue("9007199254740991"), 9007199254740991, "the largest exact integer is still a number")
    })

    it("reads booleans, null and JSON", () => {
        assert.equal(parseValue("true"), true)
        assert.equal(parseValue("false"), false)
        assert.equal(parseValue("null"), null)
        assert.deepEqual(parseValue('{"a":[1,2]}'), { a: [1, 2] })
    })

    it("leaves text that only looks like JSON as text", () => {
        assert.equal(parseValue("[WIP] fix the shop"), "[WIP] fix the shop")
        assert.equal(parseValue("{name}"), "{name}")
    })

    it("keeps quoted text as text, quotes removed", () => {
        assert.equal(parseValue('"123"'), "123")
        assert.equal(parseValue('"true"'), "true")
        assert.equal(parseValue('"say \\"hi\\""'), 'say "hi"')
        assert.equal(parseValue('"'), '"', "a lone quote is just text")
    })
})

describe("parsed JSON", () => {
    it("keeps an unquoted long integer as its digits", () => {
        const parsed = parseJSON('{"id":123456789012345678,"small":42,"big":1e21}')

        assert.equal(parsed.ok, true)
        assert.deepEqual(parsed.ok && parsed.value, { id: "123456789012345678", small: 42, big: 1e21 })
    })

    it("names the backslash, in words, when an argument was cut at a bracket", () => {
        const read = readJSON('{"a":[1,2')
        const reason = !read.ok ? read.reason : ""

        assert.equal(read.ok, false)
        assert.match(reason, /not valid JSON/)
        assert.match(reason, /put a backslash before it, two in a command file, or build the value with \$arrayOf/)
        assert.doesNotMatch(reason, /\\/, "ForgeError would double a backslash, and show a wrong escape")
    })

    it("does not blame the brackets when they are balanced", () => {
        const read = readJSON("{a:1}")
        assert.doesNotMatch(!read.ok ? read.reason : "", /backslash/)
    })
})

describe("loosely written JSON", () => {
    const value = (text: string) => {
        const parsed = parseLoose(text)
        assert.ok(parsed.ok, `${text} did not read: ${!parsed.ok && parsed.reason}`)
        return parsed.value
    }

    const reason = (text: string) => {
        const parsed = parseLoose(text)
        assert.equal(parsed.ok, false, `${text} read, and should not have`)
        return !parsed.ok ? parsed.reason : ""
    }

    it("takes bare keys, single quotes and a comma at the end", () => {
        assert.deepEqual(value("{ age: 18, name: 'Ann', tags: ['a', 'b',], }"), {
            age: 18,
            name: "Ann",
            tags: ["a", "b"],
        })
    })

    it("reads strict JSON exactly as JSON.parse does", () => {
        for (const text of ['{"a":[1,2.5,-3e2,true,false,null],"b":"x\\ny\\u0041"}', "[]", '"text"', "0", " {} "]) {
            assert.deepEqual(value(text), JSON.parse(text), text)
        }
    })

    it("takes keys in any script and IDs as keys, and keeps long IDs exact", () => {
        assert.deepEqual(value("{ имя: 'Аня', 123456789012345678: { id: 876543210987654321 } }"), {
            имя: "Аня",
            "123456789012345678": { id: "876543210987654321" },
        })
    })

    it("keeps quotes of the other kind, and reads escapes in both", () => {
        assert.deepEqual(value(String.raw`{ a: 'say "hi"', b: "it's", c: 'it\'s', d: 'AB\n' }`), {
            a: 'say "hi"',
            b: "it's",
            c: "it's",
            d: "AB\n",
        })
    })

    it("keeps a key named __proto__ a plain key, as JSON.parse does", () => {
        const read = value("{ __proto__: { polluted: 1 } }") as Record<string, unknown>

        assert.equal(Object.getPrototypeOf(read), Object.prototype)
        assert.deepEqual(Object.keys(read), ["__proto__"])
        assert.equal(({} as Record<string, unknown>).polluted, undefined)
    })

    it("evaluates nothing, and names what it could not read", () => {
        assert.match(reason("{ a: process.exit() }"), /^process is not a value, text goes in quotes$/)
        assert.match(reason("{ a: yes }"), /yes is not a value/)
        assert.match(reason("{ a: undefined }"), /undefined is not a value/)
        assert.match(
            reason("{ my key: 1 }"),
            /expected : after a key, and a key with spaces goes in quotes at "key: 1 }"/
        )
        assert.match(reason("{ a: 1 b: 2 }"), /expected , or } at "b: 2 }"/)
        assert.match(reason("{ a: 'open }"), /the quotes are never closed at "'open }"/)
        assert.match(reason("[1,,2]"), /expected a value at ",2\]"/)
        assert.match(reason("{} x"), /there is more after the value at "x"/)
        assert.match(reason("{ a: 1"), /expected , or } at the end/)
        assert.match(reason(""), /expected a value at the end/)
    })

    it("keeps to JSON's numbers", () => {
        for (const text of ["+1", ".5", "Infinity", "NaN"]) assert.ok(reason(text), text)
        assert.match(reason("0x10"), /there is more after the value/)
    })

    it("refuses a value nested too deep instead of crashing", () => {
        assert.equal(reason("[".repeat(100_000)), "it is nested too deep")
    })
})

describe("a key", () => {
    it("is refused when it leads to the prototype", () => {
        for (const key of ["__proto__", "prototype", "constructor"]) {
            assert.equal(checkKeys(["a", key]).ok, false, `"${key}" was taken`)
        }
    })

    it("is taken as it is otherwise, dots and all", () => {
        assert.equal(checkKeys(["Sword v1.2", "", "toString", "0"]).ok, true)
    })
})

describe("a template", () => {
    const render = (template: string, element: unknown, position = 1) =>
        fill(parseTemplate(template), element, position)

    it("reads keys with dots, the element and its place", () => {
        assert.equal(
            render("{#}. {name} {stats.xp} {.}", { name: "Ann", stats: { xp: 5 } }),
            '1. Ann 5 {"name":"Ann","stats":{"xp":5}}'
        )
    })

    it("reads a key holding a dot when it is escaped", () => {
        assert.equal(render("{v1\\.2}", { "v1.2": "yes" }), "yes")
    })

    it("leaves missing keys and null empty", () => {
        assert.equal(render("[{a}][{b}]", { b: null }), "[][]")
    })
})
