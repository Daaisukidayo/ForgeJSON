import { Compiler, Context, ForgeClient, Interpreter } from "@tryforge/forgescript"
import { Message, SendableChannels } from "discord.js"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const DEADLINE = 120_000
const RETRIES = 6

interface IBot {
    id: string
    name: string
    guild: string
    channel: string
}

interface ICase {
    name: string

    code?: string

    typed?: string

    args?: string[]

    check: (sent: Message[]) => string | null
}

function examples() {
    const doc = readFileSync(join(__dirname, "..", "..", "..", "functions.md"), "utf8")
    const part = doc.slice(doc.indexOf('<h3 align="center">Examples</h3>'))
    const [leaderboard, profile] = [...part.matchAll(/```js\n([\s\S]*?)```/g)].map((match) => match[1])

    return { leaderboard, profile }
}

const text = (sent: Message[]) => sent.map((message) => message.content).join("\n")

function says(expected: string) {
    return (sent: Message[]) => {
        const got = text(sent)
        return got === expected ? null : `sent ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`
    }
}

function cases(bot: IBot): ICase[] {
    const recipes = examples()
    const board = String.raw`[{"id":"111111111111111111","xp":50},{"id":"${bot.id}","xp":150},{"id":"222222222222222222","xp":300}\]`

    return [
        {
            name: "loads JSON written in a command file, a ] escaped with two backslashes",
            code: `$jsonLoad[config;{"roles":["1","2"\\]}]$jsonGet[config;roles;1]`,
            check: says("2"),
        },
        {
            name: "loads JSON typed into Discord, a ] escaped with one backslash",
            typed: String.raw`$jsonLoad[config;{"roles":["1","2"\]}]$jsonGet[config;roles;1]`,
            check: says("2"),
        },
        {
            name: "keeps an unquoted ID exact, so Discord finds the user it names",
            code: `$jsonLoad[user;{"id":$authorID}]$username[$jsonGet[user;id]]`,
            check: says(bot.name),
        },
        {
            name: "writes and reads the guild and channel IDs",
            code: `$!jsonSet[here;guild;$guildID]$!jsonSet[here;channel;$channelID]$jsonGet[here;guild]/$jsonGet[here;channel]`,
            check: says(`${bot.guild}/${bot.channel}`),
        },
        {
            name: "maps IDs through a function that asks Discord",
            code: `$arrayJoin[$arrayMap[$arrayOf[$authorID;$authorID];u;$username[$jsonGet[u]]]; & ]`,
            check: says(`${bot.name} & ${bot.name}`),
        },
        {
            name: "fills an embed from a sorted list",
            code: String.raw`$jsonLoad[users;${board}]$title[Leaderboard]$description[$arrayFormat[$arraySortBy[users;desc;xp];{#}. <@{id}> - {xp} XP]]`,
            check: (sent) => {
                const embed = sent[0]?.embeds[0]
                const lines = `1. <@222222222222222222> - 300 XP\n2. <@${bot.id}> - 150 XP\n3. <@111111111111111111> - 50 XP`

                if (embed?.title !== "Leaderboard") return `the embed's title is ${JSON.stringify(embed?.title)}`
                return embed.description === lines ? null : `the embed reads ${JSON.stringify(embed.description)}`
            },
        },
        {
            name: "turns JavaScript-style JSON typed into Discord into JSON",
            typed: String.raw`$jsonStringify[{ name: 'Ann', tags: ['a', 'b',\], }]`,
            check: says(`{"name":"Ann","tags":["a","b"]}`),
        },
        {
            name: "reports JSON that doesn't parse in the channel, pointing to $jsonStringify",
            code: `$jsonLoad[broken;{a:1}]`,
            check: (sent) =>
                /not valid JSON/.test(text(sent)) && /JavaScript way/.test(text(sent))
                    ? null
                    : `sent ${JSON.stringify(text(sent))}`,
        },
        {
            name: "passes $break on to the $loop around an array loop",
            code: `$loop[3;$arrayForEach[$arrayOf[1;2;3];x;$if[$jsonGet[x]==2;$break]$arrayPush[log;$jsonGet[x]]]$arrayPush[log;after]]$jsonGet[log]`,
            check: says("[1]"),
        },
        {
            name: "runs the leaderboard example from functions.md on ForgeDB",
            code: String.raw`$setGuildVar[levels;${board};$guildID]` + recipes.leaderboard,
            check: (sent) => {
                const embed = sent[0]?.embeds[0]
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
            name: "runs the profile example from functions.md on ForgeDB, twice",
            code:
                `$setUserVar[profile;{};$authorID]` +
                recipes.profile +
                recipes.profile +
                `$getUserVar[profile;$authorID]`,
            args: ["Magic", "Sword", "v1.2"],
            check: (sent) => {
                const got = text(sent)
                let profile: { coins?: unknown; daily?: unknown; inventory?: unknown }

                try {
                    profile = JSON.parse(got)
                } catch {
                    return `sent ${JSON.stringify(got)}, not JSON`
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

async function run(client: ForgeClient, channel: SendableChannels, probe: Message, test: ICase) {
    let code = test.code ?? ""
    let obj = probe

    if (test.typed !== undefined) {
        const typed = await channel.send({ content: test.typed, allowedMentions: { parse: [] } })

        code = (await channel.messages.fetch(typed.id)).content
        obj = typed
    }

    const before = (await channel.messages.fetch({ limit: 1 })).first()?.id ?? obj.id

    await Interpreter.run(
        new Context({
            client,
            data: Compiler.compile(code),
            command: null,
            args: test.args ?? [],
            environment: {},
            obj,
        })
    )

    for (let attempt = 0; ; attempt++) {
        const fetched = await channel.messages.fetch({ after: before, limit: 20, cache: false })
        const sent = [...fetched.values()]
            .filter((message) => message.author.id === client.user.id)
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp)

        if (sent.length || attempt === RETRIES) return sent
        await new Promise((resolve) => setTimeout(resolve, 500))
    }
}

export async function runSmoke(client: ForgeClient) {
    const deadline = setTimeout(() => {
        console.error("ForgeJSON live check: ran out of time")
        process.exit(1)
    }, DEADLINE)

    const id = process.env.SMOKE_CHANNEL

    const channel = id ? await client.channels.fetch(id).catch(() => null) : null
    if (!channel?.isSendable() || !("guildId" in channel)) {
        console.error("ForgeJSON live check: set SMOKE_CHANNEL to a text channel of a guild the bot can send to")
        process.exit(1)
    }

    const bot: IBot = { id: client.user.id, name: client.user.username, guild: channel.guildId, channel: channel.id }
    const probe = await channel.send("ForgeJSON live check")

    let passed = 0
    const all = cases(bot)

    for (const test of all) {
        let problem: string | null

        try {
            problem = test.check(await run(client, channel, probe, test))
        } catch (err) {
            problem = err instanceof Error ? err.message : String(err)
        }

        if (!problem) passed++
        console.log(`${problem ? "✗" : "✓"} ${test.name}${problem ? `\n    ${problem}` : ""}`)
    }

    console.log(`\n${passed}/${all.length} passed`)

    clearTimeout(deadline)
    await client.destroy()
    process.exit(passed === all.length ? 0 : 1)
}
