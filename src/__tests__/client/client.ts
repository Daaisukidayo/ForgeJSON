import { ForgeClient, LogPriority } from "@tryforge/forgescript"
import { ForgeDB } from "@tryforge/forge.db"
import { config } from "dotenv"
import { Events } from "discord.js"
import { ForgeJSON } from "../.."
import { runSmoke } from "./smoke"

config({ quiet: true })

const smoke = process.argv.includes("smoke")

const database = new ForgeDB({ type: "better-sqlite3" })

const client = new ForgeClient({
    logLevel: LogPriority.High,
    intents: ["Guilds", "MessageContent", "GuildMessages"],
    events: ["clientReady", "messageCreate"],
    extensions: [database, new ForgeJSON()],
    prefixes: ["!", "<@$botID>"],
    token: process.env.TOKEN,
})

database.variables({ levels: "[]", profile: "{}" })

client.commands.add({
    type: Events.ClientReady,
    code: `$logger[Info;Ready on client $username[$botID]]`,
})

client.commands.add({
    name: "eval",
    aliases: ["e"],
    type: Events.MessageCreate,
    code: `
    $onlyIf[$authorID==$botOwnerID]
    $let[text;$eval[$message;false]]
    $if[$charCount[$get[text]]>1950;$attachment[$get[text];result.json;true];$codeBlock[$get[text];JSON]]
    `,
})

if (smoke) client.once(Events.ClientReady, () => void runSmoke(client))

client.login()
