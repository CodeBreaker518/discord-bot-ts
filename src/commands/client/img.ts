import { CommandInteraction, Message, EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";
import puppeteer from "puppeteer";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("img")
    .setDescription("Busca una imagen mediante un prompt")
    .addStringOption((option) => option.setName("query").setDescription("Término de búsqueda para la imagen").setRequired(true))
    .addIntegerOption((option) => option.setName("numero").setDescription("Número de la imagen a mostrar (por defecto 1)").setMinValue(1).setMaxValue(35)),

  async execute(client, interactionOrMessage) {
    let query: string;
    let reply;
    let imageNumber = 1;

    try {
      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        query = interactionOrMessage.options.getString("query", true);
        imageNumber = interactionOrMessage.options.getInteger("numero") || 1;
        await interactionOrMessage.deferReply();
      } else if (interactionOrMessage instanceof Message) {
        const args = interactionOrMessage.content.split(" ");
        const lastArg = args[args.length - 1];
        if (/^\d+$/.test(lastArg)) {
          imageNumber = parseInt(lastArg);
          query = args.slice(1, -1).join(" ");
        } else {
          query = args.slice(1).join(" ");
        }
        reply = await interactionOrMessage.reply("Buscando imagen...");
      } else {
        throw new Error("Tipo de interacción no soportado");
      }

      console.log(`Buscando: ${query}, Número de imagen: ${imageNumber}`);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`https://gibiru.com/results.html?q=${encodeURIComponent(query)}&rt=image&cx=partner-pub-5956360965567042%3A8627692578&cof=FORID%3A11&ie=UTF-8`);

      // Esperar a que los resultados de la imagen se carguen
      await page.waitForSelector(".gsc-results .gsc-imageResult", { timeout: 5000 });

      // Extraer las URLs de las imágenes
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll(".gsc-results .gsc-imageResult img.gs-image");
        return Array.from(imgElements).map((img) => (img as HTMLImageElement).src);
      });

      await browser.close();

      console.log(`Imágenes encontradas: ${images.length}`);
      console.log("URLs de imágenes encontradas:", images);

      if (images.length > 0 && imageNumber <= images.length) {
        const imageUrl = images[imageNumber - 1];
        console.log(`URL de imagen seleccionada: ${imageUrl}`);

        const embed = new EmbedBuilder().setTitle(`Imagen ${imageNumber} de "${query}"`).setImage(imageUrl).setColor("Random");

        if (interactionOrMessage instanceof ChatInputCommandInteraction) {
          await interactionOrMessage.editReply({ embeds: [embed] });
        } else if (interactionOrMessage instanceof Message) {
          await reply?.edit({ content: " ", embeds: [embed] });
        }
      } else {
        throw new Error(`No se encontró la imagen número ${imageNumber} para "${query}"`);
      }
    } catch (error) {
      console.error("Error detallado:", error);
      const errorMessage = error instanceof Error ? error.message : "Hubo un error al buscar la imagen.";

      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        await interactionOrMessage.editReply(errorMessage);
      } else if (interactionOrMessage instanceof Message) {
        await reply?.edit(errorMessage);
      }
    }
  },
};
