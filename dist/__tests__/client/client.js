"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const forge_db_1 = require("@tryforge/forge.db");
const dotenv_1 = require("dotenv");
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const smoke_1 = require("./smoke");
(0, dotenv_1.config)({ quiet: true });
const smoke = process.argv.includes("smoke");
const database = new forge_db_1.ForgeDB({ type: "better-sqlite3" });
const client = new forgescript_1.ForgeClient({
    logLevel: forgescript_1.LogPriority.High,
    intents: ["Guilds", "MessageContent", "GuildMessages"],
    events: ["clientReady", "messageCreate"],
    extensions: [database, new __1.ForgeJSON()],
    prefixes: ["!", "<@$botID>"],
    token: process.env.TOKEN,
});
database.variables({ levels: "[]", profile: "{}" });
client.commands.add({
    type: discord_js_1.Events.ClientReady,
    code: `$logger[Info;Ready on client $username[$botID]]`,
});
client.commands.add({
    name: "eval",
    aliases: ["e"],
    type: discord_js_1.Events.MessageCreate,
    code: `
    $onlyIf[$authorID==$botOwnerID]
    $let[text;$eval[$message;false]]
    $if[$charCount[$get[text]]>1950;$attachment[$get[text];result.json;true];$codeBlock[$get[text];JSON]]
    `,
});
if (smoke)
    client.once(discord_js_1.Events.ClientReady, () => void (0, smoke_1.runSmoke)(client));
client.login();
//# sourceMappingURL=client.js.map