import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { failure, json, output } from "./support/harness"

const users = () => ({
    users: [
        { id: "111", name: "Ann", xp: 50, stats: { level: 2 } },
        { id: "222", name: "bob", xp: "500", stats: { level: 9 } },
        { id: "333", name: "Cid", stats: { level: 5 } },
        { id: "444", name: "Dee", xp: 120, stats: { level: 5 } },
    ],
})

const ids = (list: { id: string }[]) => list.map((user) => user.id)

describe("$arraySortBy", () => {
    it("sorts by a key, numbers stored as text included, missing ones last", async () => {
        assert.deepEqual(ids(await json("$arraySortBy[users;desc;xp]", users())), ["222", "444", "111", "333"])
        assert.deepEqual(ids(await json("$arraySortBy[users;;xp]", users())), ["111", "444", "222", "333"])
    })

    it("sorts by a key inside a key, keeping ties in their order", async () => {
        assert.deepEqual(ids(await json("$arraySortBy[users;asc;stats;level]", users())), ["111", "333", "444", "222"])
    })

    it("leaves the original as it was", async () => {
        const env = users()
        await output("$arraySortBy[users;desc;xp]", env)

        assert.deepEqual(ids(env.users), ["111", "222", "333", "444"])
    })

    it("orders IDs exactly, even ones a double can't tell apart", async () => {
        const env = { list: ["123456789012345679", "123456789012345678", "99"] }
        assert.deepEqual(await json("$arraySortBy[list]", env), ["99", "123456789012345678", "123456789012345679"])
    })

    it("sorts text naturally and without caring for case", async () => {
        assert.deepEqual(await json(String.raw`$arraySortBy[["item10","Item2","item1"\]]`), [
            "item1",
            "Item2",
            "item10",
        ])
        assert.deepEqual(ids(await json("$arraySortBy[users;;name]", users())), ["111", "222", "333", "444"])
    })
})

describe("a condition over every element", () => {
    it("compares numbers, however they are stored", async () => {
        assert.deepEqual(ids(await json("$arrayFilter[users;u;$jsonGet[u;xp]>=100]", users())), ["222", "444"])
        assert.deepEqual(ids(await json("$arrayFilter[users;u;$jsonGet[u;stats;level]==5]", users())), ["333", "444"])
    })

    it("takes any function that gives true or false", async () => {
        const env = {
            items: [
                { name: "Iron sword", tags: ["melee"] },
                { name: "Bow", tags: ["ranged"] },
            ],
        }

        assert.equal((await json("$arrayFilter[items;i;$startsWith[$jsonGet[i;name];Iron]]", env)).length, 1)
        assert.equal((await json("$arrayFind[items;i;$arrayIncludes[$jsonGet[i;tags];ranged]]", env)).name, "Bow")
        assert.equal((await json("$arrayFind[items;i;$jsonGet[i;name]!=Bow]", env)).name, "Iron sword")
    })

    it("finds an element, where it is, and how many there are", async () => {
        assert.equal((await json("$arrayFind[users;u;$jsonGet[u;id]==333]", users())).name, "Cid")
        assert.equal(await output("$arrayFindIndex[users;u;$jsonGet[u;id]==333]", users()), "2")
        assert.equal(
            await output(
                "$arrayFind[users;u;$jsonGet[u;id]==999]|$arrayFindIndex[users;u;$jsonGet[u;id]==999]",
                users()
            ),
            "|-1"
        )
        assert.equal(await output("$arrayCount[users;u;$jsonGet[u;stats;level]==5]", users()), "2")
    })

    it("gives a place on a leaderboard together with $arraySortBy", async () => {
        assert.equal(await output("$arrayFindIndex[$arraySortBy[users;desc;xp];u;$jsonGet[u;id]==111]", users()), "2")
    })
})

describe("$arrayPluck and $arrayGroupBy", () => {
    it("pluck a key, a key inside a key too", async () => {
        assert.deepEqual(await json("$arrayPluck[users;xp]", users()), [50, "500", null, 120])
        assert.deepEqual(await json("$arrayPluck[users;stats;level]", users()), [2, 9, 5, 5])
    })

    it("group by a key", async () => {
        const groups = await json("$arrayGroupBy[users;name]", users())
        const levels = await json("$arrayGroupBy[users;stats;level]", users())

        assert.deepEqual(Object.keys(groups), ["Ann", "bob", "Cid", "Dee"], "groups keep the order they were met in")
        assert.deepEqual(ids(levels[5]), ["333", "444"])
        assert.deepEqual(Object.keys(levels), ["2", "5", "9"], "though numeric keys always sort, as in any JSON object")
    })
})

describe("$arraySum, $arrayAverage, $arrayMin and $arrayMax", () => {
    it("count numbers stored either way and skip the rest", async () => {
        const all = "$arraySum[users;xp] $arrayAverage[users;xp] $arrayMin[users;xp] $arrayMax[users;xp]"
        assert.equal(await output(all, users()), "670 223.333333333333 50 500")
    })

    it("give 0 or nothing for an empty list, and add up without floating point noise", async () => {
        assert.equal(await output("$arraySum[none]|$arrayAverage[none]|$arrayMin[none]|$arrayMax[none]"), "0|||")
        assert.equal(await output(String.raw`$arraySum[[0.1,0.2\]]`), "0.3")
    })

    it("count text only when it holds a number written in decimals", async () => {
        assert.equal(await output(String.raw`$arraySum[["0x10","0b11","5"," 7 ","1e1"\]]`), "22")
    })
})

describe("$arrayFormat", () => {
    const board = () => ({
        users: Array.from({ length: 12 }, (_, i) => ({ id: String(100 + i), xp: (i + 1) * 10, stats: { level: i } })),
    })

    it("writes a leaderboard in one call", async () => {
        const text = await output("$arrayFormat[$arraySortBy[users;desc;xp];{#}. <@{id}> - {xp} XP;1;3]", board())
        assert.equal(text, "1. <@111> - 120 XP\n2. <@110> - 110 XP\n3. <@109> - 100 XP")
    })

    it("numbers the next page on from the last", async () => {
        assert.equal(await output("$arrayFormat[users;{#}:{stats.level};2;5;, ]", board()), "6:5, 7:6, 8:7, 9:8, 10:9")
    })

    it("writes the element itself and leaves missing keys empty", async () => {
        assert.equal(await output(String.raw`$arrayFormat[["a","b"\];[{.}\] {nope};;;|]`), "[a] |[b] ")
    })

    it("keeps doubled braces, and placeholders it can't read, as text", async () => {
        assert.equal(await output(String.raw`$arrayFormat[[1\];{{{.}}}]`), "{1}")
        assert.equal(await output(String.raw`$arrayFormat[[1\];{} {__proto__} {#]`), "{} {__proto__} {#")
    })

    it("refuses a page that can't be", async () => {
        assert.match(await failure("$arrayFormat[users;{id};0;5]", board()), /pages start at 1/)
    })
})
