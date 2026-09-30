import { Compiler, Context, ForgeClient, Interpreter, Logger } from "@tryforge/forgescript"
import { APIEmbed, GuildMember, GuildTextBasedChannel, User } from "discord.js"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const DEADLINE = 60_000

const CLEAN_UP = "$deleteGuildVar[levels;$guildID]$deleteUserVar[profile;$authorID]"

const paint = (codes: string) => (text: string) => (process.env.NO_COLOR ? text : `\u001b[${codes}m${text}\u001b[0m`)

const green = paint("32")
const red = paint("31")
const cyan = paint("36")
const grey = paint("90")

interface IBot {
    id: string
    name: string
    guild: string
    channel: string
}

interface IPlace {
    author: User
    member: GuildMember | null
    guild: GuildTextBasedChannel["guild"]
    channel: GuildTextBasedChannel
}

interface IResult {
    text: string
    embeds: APIEmbed[]
    errors: string[]
}

interface ICase {
    id: string

    name: string

    code: string

    args?: string[]

    failing?: true

    check: (result: IResult) => string | null
}

function examples() {
    const doc = readFileSync(join(__dirname, "..", "..", "..", "functions.md"), "utf8")
    const part = doc.slice(doc.indexOf('<h3 align="center">Examples</h3>'))
    const [leaderboard, profile] = [...part.matchAll(/```js\n([\s\S]*?)```/g)].map((match) => match[1])

    return { leaderboard, profile }
}

function says(expected: string) {
    return ({ text }: IResult) =>
        text === expected ? null : `gave ${JSON.stringify(text)}, expected ${JSON.stringify(expected)}`
}

function cases(bot: IBot): ICase[] {
    const recipes = examples()
    const board = String.raw`[{"id":"111111111111111111","xp":50},{"id":"${bot.id}","xp":150},{"id":"222222222222222222","xp":300}\]`

    return [
        {
            id: "escape-file",
            name: "loads JSON written in a command file, a ] escaped with two backslashes",
            code: `$jsonLoad[config;{"roles":["1","2"\\]}]$jsonGet[config;roles;1]`,
            check: says("2"),
        },
        {
            id: "escape-typed",
            name: "loads JSON the way it's typed into Discord, a ] escaped with one backslash",
            code: String.raw`$jsonLoad[config;{"roles":["1","2"\]}]$jsonGet[config;roles;1]`,
            check: says("2"),
        },
        {
            id: "id",
            name: "keeps an unquoted ID exact, so Discord finds the user it names",
            code: `$jsonLoad[user;{"id":$authorID}]$username[$jsonGet[user;id]]`,
            check: says(bot.name),
        },
        {
            id: "guild-ids",
            name: "writes and reads the guild and channel IDs",
            code: `$!jsonSet[here;guild;$guildID]$!jsonSet[here;channel;$channelID]$jsonGet[here;guild]/$jsonGet[here;channel]`,
            check: says(`${bot.guild}/${bot.channel}`),
        },
        {
            id: "map",
            name: "maps IDs through a function that asks Discord",
            code: `$arrayJoin[$arrayMap[$arrayOf[$authorID;$authorID];u;$username[$jsonGet[u]]]; & ]`,
            check: says(`${bot.name} & ${bot.name}`),
        },
        {
            id: "embed",
            name: "fills an embed from a sorted list",
            code: String.raw`$jsonLoad[users;${board}]$title[Leaderboard]$description[$arrayFormat[$arraySortBy[users;desc;xp];{#}. <@{id}> - {xp} XP]]`,
            check: ({ embeds }) => {
                const embed = embeds[0]
                const lines = `1. <@222222222222222222> - 300 XP\n2. <@${bot.id}> - 150 XP\n3. <@111111111111111111> - 50 XP`

                if (embed?.title !== "Leaderboard") return `the embed's title is ${JSON.stringify(embed?.title)}`
                return embed.description === lines ? null : `the embed reads ${JSON.stringify(embed.description)}`
            },
        },
        {
            id: "loose",
            name: "turns JavaScript-style JSON, typed the Discord way, into JSON",
            code: String.raw`$jsonStringify[{ name: 'Ann', tags: ['a', 'b',\], }]`,
            check: says(`{"name":"Ann","tags":["a","b"]}`),
        },
        {
            id: "error",
            name: "stops on JSON that doesn't parse, pointing to $jsonStringify",
            code: `$jsonLoad[broken;{a:1}]`,
            failing: true,
            check: ({ errors }) =>
                /not valid JSON/.test(errors[0] ?? "") && /JavaScript way/.test(errors[0] ?? "")
                    ? null
                    : `failed with ${JSON.stringify(errors)}`,
        },
        {
            id: "break",
            name: "passes $break on to the $loop around an array loop",
            code: `$loop[3;$arrayForEach[$arrayOf[1;2;3];x;$if[$jsonGet[x]==2;$break]$arrayPush[log;$jsonGet[x]]]$arrayPush[log;after]]$jsonGet[log]`,
            check: says("[1]"),
        },
        {
            id: "leaderboard",
            name: "runs the leaderboard example from functions.md on ForgeDB",
            code: String.raw`$setGuildVar[levels;${board};$guildID]` + recipes.leaderboard,
            check: ({ embeds }) => {
                const embed = embeds[0]
                const lines = `**1.** <@222222222222222222> - 300 XP\n**2.** <@${bot.id}> - 150 XP\n**3.** <@111111111111111111> - 50 XP`

                if (embed?.title !== "Leaderboard, page 1/1")
                    return `the embed's title is ${JSON.stringify(embed?.title)}`
                if (embed.description !== lines) return `the embed reads ${JSON.stringify(embed.description)}`
                return embed.footer?.text === "You are #2"
                    ? null
                    : `the footer reads ${JSON.stringify(embed.footer?.text)}`
            },
        },
        {
            id: "profile",
            name: "runs the profile example from functions.md on ForgeDB, twice",
            code:
                `$setUserVar[profile;{};$authorID]` +
                recipes.profile +
                recipes.profile +
                `$getUserVar[profile;$authorID]`,
            args: ["Magic", "Sword", "v1.2"],
            check: ({ text }) => {
                let profile: { coins?: unknown; daily?: unknown; inventory?: unknown }

                try {
                    profile = JSON.parse(text)
                } catch {
                    return `gave ${JSON.stringify(text)}, not JSON`
                }

                const expected = JSON.stringify({ "Magic Sword v1.2": { count: 2 } })
                if (profile.coins !== 500) return `coins are ${profile.coins}`
                if (typeof profile.daily !== "number") return `daily is ${JSON.stringify(profile.daily)}`
                return JSON.stringify(profile.inventory) === expected
                    ? null
                    : `the inventory is ${JSON.stringify(profile.inventory)}`
            },
        },
    ]
}

function chosen(all: ICase[]) {
    const only = process.env.SMOKE_ONLY?.split(",")
        .map((id) => id.trim())
        .filter(Boolean)

    if (!only?.length) return all

    const unknown = only.filter((id) => !all.some((test) => test.id === id))
    if (unknown.length) {
        console.error(
            red(`No case called "${unknown.join(", ")}". Pick from: ${all.map((test) => test.id).join(", ")}`)
        )
        process.exit(1)
    }

    return all.filter((test) => only.includes(test.id))
}

async function execute(client: ForgeClient, place: IPlace, code: string, args: string[] = []): Promise<IResult> {
    const errors: string[] = []
    const error = Logger.error

    Logger.error = (...parts: unknown[]) => void errors.push(parts.map(String).join(" "))

    try {
        const ctx = new Context({
            client,
            data: Compiler.compile(code),
            command: null,
            args,
            environment: {},
            obj: place as never,
            doNotSend: true,
            redirectErrorsToConsole: true,
        })
        const text = await Interpreter.run(ctx)

        return { text: text?.trim() ?? "", embeds: ctx.container.embeds.map((embed) => embed.toJSON()), errors }
    } finally {
        Logger.error = error
    }
}

export async function runSmoke(client: ForgeClient) {
    const deadline = setTimeout(() => {
        console.error(red("ForgeJSON live check: ran out of time"))
        process.exit(1)
    }, DEADLINE)

    const id = process.env.SMOKE_CHANNEL

    const channel = id ? await client.channels.fetch(id).catch(() => null) : null
    if (!channel?.isTextBased() || channel.isDMBased()) {
        console.error(red("ForgeJSON live check: set SMOKE_CHANNEL to a text channel of a guild the bot is in"))
        process.exit(1)
    }

    const member = await channel.guild.members.fetchMe().catch(() => null)
    const place: IPlace = { author: client.user, member, guild: channel.guild, channel }

    const bot: IBot = { id: client.user.id, name: client.user.username, guild: channel.guildId, channel: channel.id }
    const all = cases(bot)
    const tests = chosen(all)

    console.log(cyan("ForgeJSON live check") + grey(`, ${tests.length} of ${all.length} cases, nothing sent`))

    const failed: string[] = []

    for (const test of tests) {
        let problem: string | null

        try {
            const result = await execute(client, place, test.code, test.args)
            problem = !test.failing && result.errors.length ? `failed: ${result.errors[0]}` : test.check(result)
        } catch (err) {
            problem = err instanceof Error ? err.message : String(err)
        }

        if (problem) failed.push(test.id)
        console.log(`${problem ? red("FAIL") : green("ok  ")} ${test.name}${problem ? `\n     ${grey(problem)}` : ""}`)
    }

    const cleaned = await execute(client, place, CLEAN_UP).catch((err: unknown) => ({ errors: [String(err)] }))
    if (cleaned.errors.length) console.error(red(`could not clean up: ${cleaned.errors[0]}`))

    const passed = tests.length - failed.length
    console.log("\n" + (failed.length ? red : green)(`${passed}/${tests.length} passed`))
    if (failed.length) console.log(grey(`run them again with SMOKE_ONLY=${failed.join(",")}`))

    clearTimeout(deadline)
    await client.destroy()
    process.exit(failed.length ? 1 : 0)
}
