import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("Unlock this ticket.");

export async function execute(interaction) {
  await interaction.client.emit("interactionCreate", { ...interaction, isButton: () => true, customId: "unlockTicket", reply: interaction.reply.bind(interaction) });
}
