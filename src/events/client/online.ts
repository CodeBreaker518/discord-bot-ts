import { handleCommands } from "../../handlers/commands";
import { type Event } from "../../types";
import { browserManager } from "../../lib/browserManager";

export const event: Event<"ready"> = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`[from CLIENT] ${client.user.username} is online!`);

    await browserManager.initialize();
    console.log("Browser initialized");
    await handleCommands(client);
  },
};
