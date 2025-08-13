import "dotenv/config";
import { REST, Routes } from "discord.js";
import * as panel from "./commands/panel.js";
import * as ticket from "./commands/ticket.js";
import * as add from "./commands/add.js";
import * as remove from "./commands/remove.js";
import * as claim from "./commands/claim.js";
import * as unclaim from "./commands/unclaim.js";
import * as unlock from "./commands/unlock.js";
import * as stats from "./commands/stats.js";

const commands = [panel, ticket, add, remove, claim, unclaim, unlock, stats].map(c => c.data.toJSON());
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
      console.log("✅ Registered guild commands");
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log("✅ Registered global commands");
    }
  } catch (e) {
    console.error(e);
  }
})();
