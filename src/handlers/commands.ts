import { Table } from "tablifier";
import type { Command, GlobClient } from "../types";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { LoadFiles } from "../lib/files";

export const handleCommands = async (client: GlobClient): Promise<void> => {
  const table = new Table("Command", "State");

  client.commands.clear();

  const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  const files = await LoadFiles("commands");
  files.forEach((file) => {
    const { command } = require(file) as { command: Command };
    try {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      table.addRow(command.data.name, "✅");
    } catch (error) {
      table.addRow(command.data.name, "❌");
    }
  });
  client.application?.commands.set(commands);
  console.log(table.toString());
};
