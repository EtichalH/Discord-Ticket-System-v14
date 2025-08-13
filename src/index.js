import "dotenv/config";
import fs from "fs-extra";
import { Client, GatewayIntentBits, Partials, Collection, Events } from "discord.js";
import { handleButton } from "./interactions/buttons.js";
import { handleModal } from "./interactions/modals.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();

// Auto-load command modules
const commandsPath = new URL('./commands/', import.meta.url); // ✅ only load commands

for (const file of (await fs.readdir(commandsPath))) {
  if (!file.endsWith(".js")) continue;
  const mod = await import(new URL(file, commandsPath));
  client.commands.set(mod.data.name, mod);
}

client.once(Events.ClientReady, c => console.log(`✅ Logged in as ${c.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      await cmd.execute(interaction, client);
    } else if (interaction.isButton()) {
      await handleButton(interaction, client);
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction, client);
    }
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: "❌ Something went wrong.", ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: "❌ Something went wrong.", ephemeral: true }).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
