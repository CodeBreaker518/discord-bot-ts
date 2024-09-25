import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export const command: Command = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Muestra la latencia con el bot"),

  async execute(client, interactionOrMessage) {
    const initialEmbed = new EmbedBuilder().setTitle("Ping").setDescription("Calculando latencia...").setColor("Aqua");

    let reply;

    if ("commandName" in interactionOrMessage) {
      // Es una interacción
      reply = await interactionOrMessage.deferReply({ fetchReply: true });
    } else {
      // Es un mensaje
      reply = await interactionOrMessage.reply({ embeds: [initialEmbed] });
    }

    const delay = reply.createdTimestamp - interactionOrMessage.createdTimestamp;

    const updatedEmbed = new EmbedBuilder().setTitle("Ping").setDescription(`Latencia es de: \`${delay}ms\``).setColor("Aqua");

    if ("commandName" in interactionOrMessage) {
      await interactionOrMessage.editReply({ embeds: [updatedEmbed] });
    } else {
      await reply.edit({ embeds: [updatedEmbed] });
    }
  },
};
