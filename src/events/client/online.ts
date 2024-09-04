import { handleCommands } from "../../handlers/commands";
import { type Event } from "../../types";

export const event: Event<"ready"> = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`[from CLIENT] ${client.user.username} is online!`);

    handleCommands(client);
  },
};
