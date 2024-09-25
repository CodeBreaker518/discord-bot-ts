import { CommandInteraction, Message, EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel, PermissionFlagsBits, User } from "discord.js";
import { Command } from "../../types";

const cooldowns = new Map<string, number>();
const COOLDOWN_TIME = 5000; // 5 segundos de cooldown

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Elimina un número específico de mensajes en el canal")
    .addIntegerOption((option) => option.setName("cantidad").setDescription("Número de mensajes a eliminar").setRequired(true).setMinValue(1).setMaxValue(20))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(client, interactionOrMessage) {
    let quantity: number;
    let canal: TextChannel | null = null;
    let userId: string;
    let user: User | null = null;

    try {
      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        userId = interactionOrMessage.user.id;
        user = interactionOrMessage.user;
        quantity = interactionOrMessage.options.getInteger("cantidad", true);
        canal = interactionOrMessage.channel as TextChannel;
        await interactionOrMessage.deferReply({ ephemeral: true });
      } else if (interactionOrMessage instanceof Message) {
        userId = interactionOrMessage.author.id;
        user = interactionOrMessage.author;
        const args = interactionOrMessage.content.split(" ");
        if (args.length !== 2 || isNaN(Number(args[1]))) {
          await interactionOrMessage.reply(`${user}, uso incorrecto. Utiliza \`!delete <cantidad>\` o el comando de barra.`);
          return;
        }
        quantity = parseInt(args[1]);
        canal = interactionOrMessage.channel as TextChannel;
      } else {
        throw new Error("Tipo de interacción no soportado");
      }

      // Comprobación de cooldown
      const lastUsed = cooldowns.get(userId);
      if (lastUsed && Date.now() - lastUsed < COOLDOWN_TIME) {
        const remainingTime = (COOLDOWN_TIME - (Date.now() - lastUsed)) / 1000;
        throw new Error(`${user}, por favor espera ${remainingTime.toFixed(1)} segundos antes de usar este comando de nuevo.`);
      }

      if (!canal || !canal.isTextBased() || canal.isDMBased()) {
        throw new Error(`${user}, este comando solo puede ser usado en canales de texto del servidor.`);
      }

      if (quantity < 1 || quantity > 20) {
        throw new Error(`${user}, por favor proporciona un número entre 1 y 20.`);
      }

      const mensajesEliminados = await canal.bulkDelete(quantity, true);

      // Actualizar el cooldown
      cooldowns.set(userId, Date.now());

      const embedExito = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`${user}, se han eliminado ${mensajesEliminados.size} mensaje(s) correctamente.`)
        .setFooter({ text: "Los mensajes de más de 14 días no pueden ser eliminados." });

      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        await interactionOrMessage.editReply({ embeds: [embedExito] });
      } else {
        const mensaje = await canal.send({ content: `${user}`, embeds: [embedExito] });
        setTimeout(() => mensaje.delete().catch(() => {}), 5000);
      }
    } catch (error) {
      console.error("Error al eliminar mensajes:", error);

      const embedError = new EmbedBuilder().setColor("Red").setDescription(error instanceof Error ? error.message : `${user}, ocurrió un error al eliminar los mensajes.`);

      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        if (interactionOrMessage.deferred) {
          await interactionOrMessage.editReply({ embeds: [embedError] }).catch(() => {});
        } else {
          await interactionOrMessage.reply({ embeds: [embedError], ephemeral: true }).catch(() => {});
        }
      } else if (canal) {
        try {
          const mensaje = await canal.send({ content: `${user}`, embeds: [embedError] });
          setTimeout(() => mensaje.delete().catch(() => {}), 5000);
        } catch (sendError) {
          console.error("No se pudo enviar el mensaje de error:", sendError);
        }
      } else {
        console.error("No se pudo enviar el mensaje de error: canal no definido");
      }
    }
  },
};
