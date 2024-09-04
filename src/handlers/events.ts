import { Table } from "tablifier";
import { type Event, type GlobClient } from "../types";
import { LoadFiles } from "../lib/files";

export const handleEvents = async (client: GlobClient): Promise<void> => {
  const table = new Table("Event Name", "Status");

  client.events.clear();

  const files = await LoadFiles("events");

  files.forEach((file) => {
    const { event } = require(file) as { event: Event<any> };

    try {
      const execute = (...args: any[]) => event.execute(client, ...args);
      client.events.set(event.name, execute);

      if (event.rest) {
        if (event.once) client.rest.once(event.name, execute);
        else client.rest.on(event.name, execute);
      } else {
        if (event.once) client.on(event.name, execute);
        else client.on(event.name, execute);
      }

      table.addRow(event.name, "✅");
    } catch (error) {
      table.addRow(event.name, "❌");
    }
  });
  console.log(table.toString());
};
