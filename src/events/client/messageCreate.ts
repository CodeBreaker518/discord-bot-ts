import { Message } from "discord.js";
import { Event } from "../../types";
import { CONFIG } from "../../consts";

const { prefix } = CONFIG;

export const event: Event<"messageCreate"> = {
  name: "messageCreate",
  async execute(client, message: Message) {
    // Ignora los mensajes que no comienzan con el prefijo o que son enviados por bots
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Extrae el comando y los argumentos del mensaje
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase() as string;

    // Verifica si el comando existe
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      command.execute(client, message);
    } catch (error) {
      console.error(error);
      await message.reply("Hubo un error al ejecutar ese comando.");
    }
  },
};
