import {
  CommandInteraction,
  Message,
  EmbedBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../types";
import axios from "axios";
import * as cheerio from "cheerio";

// Palabras bloqueadas
const bannedWords: any[] = [
  // "gore",
  // "porno",
  // "hentai",
  // "osos maduros",
  // "sexy",
  // "sexo",
  // "sex",
  // "desnudo",
  // "desnuda",
  // "porn",
];

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("img")
    .setDescription("Busca una imagen mediante un prompt")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Término de búsqueda para la imagen")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(client, interactionOrMessage) {
    let query: string;
    let reply;
    let n = 0; // Índice de la imagen por defecto (Bing empieza en 0)

    try {
      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        query = interactionOrMessage.options.getString("query", true);
        await interactionOrMessage.deferReply();
      } else if (interactionOrMessage instanceof Message) {
        const args = interactionOrMessage.content.split(" ").slice(1);
        query = args.join(" ");
        reply = await interactionOrMessage.reply("Buscando imagen...");

        // Intenta extraer el número de imagen si está presente
        const lastTwo = query.slice(-2);
        if (!isNaN(parseInt(lastTwo))) {
          n = parseInt(lastTwo) - 1; // Restamos 1 porque Bing empieza en 0
          query = query.slice(0, -2).trim();
        }
      } else {
        throw new Error("Tipo de interacción no soportado");
      }

      // Reemplazar palabras bloqueadas
      for (const word of bannedWords) {
        query = query.replace(new RegExp(word, "gi"), "icono de bloqueado");
      }

      console.log(`Buscando: ${query}`);

      const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(
        query
      )}&safesearch=strict`;
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      console.log(`Respuesta recibida. Estado: ${response.status}`);
      console.log(`Longitud del contenido: ${response.data.length}`);

      const $ = cheerio.load(response.data);

      const images = $(".iusc")
        .map((i, el) => {
          const m = $(el).attr("m");
          if (m) {
            try {
              const metadata = JSON.parse(m);
              return metadata.murl;
            } catch (e) {
              console.error("Error parsing image metadata:", e);
              return null;
            }
          }
          return null;
        })
        .get()
        .filter((url) => url !== null);

      console.log(`Imágenes encontradas: ${images.length}`);
      console.log(`Primeras 3 URLs: ${images.slice(0, 3).join(", ")}`);

      if (images.length > 0 && n < images.length) {
        const imageUrl = images[n];
        console.log(`URL de imagen seleccionada: ${imageUrl}`);

        const embed = new EmbedBuilder()
          .setTitle(`Imagen de "${query}"`)
          .setImage(imageUrl)
          .setColor("Random");

        if (interactionOrMessage instanceof ChatInputCommandInteraction) {
          await interactionOrMessage.editReply({ embeds: [embed] });
        } else if (interactionOrMessage instanceof Message) {
          await reply?.edit({ content: " ", embeds: [embed] });
        }
      } else {
        throw new Error(`No se encontraron imágenes válidas para "${query}"`);
      }
    } catch (error) {
      console.error("Error detallado:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al buscar la imagen.";

      if (interactionOrMessage instanceof ChatInputCommandInteraction) {
        await interactionOrMessage.editReply(errorMessage);
      } else if (interactionOrMessage instanceof Message) {
        await reply?.edit(errorMessage);
      }
    }
  },
};
