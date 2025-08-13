import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unclaim")
  .setDescription("Unclaim the current ticket.");

export async function execute(interaction) {
  await interaction.client.emit("interactionCreate", { ...interaction, isButton: () => true, customId: "unclaimTicket", reply: interaction.reply.bind(interaction) });
}
