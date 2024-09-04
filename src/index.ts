import "dotenv/config";
import { Client, Collection } from "discord.js";
import { type GlobClient } from "./types";
import { handleEvents } from "./handlers/events";
import { CONFIG } from "./consts";

const TOKEN = process.env.DISCORD_ACCESS_TOKEN;

export const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers", "MessageContent"],
}) as GlobClient;

client.config = CONFIG;
client.events = new Collection();
client.commands = new Collection();

handleEvents(client);

client.login(TOKEN);
