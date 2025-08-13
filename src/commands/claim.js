import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("claim")
  .setDescription("Claim the current ticket.");

export async function execute(interaction) {
  await interaction.client.emit("interactionCreate", {
    ...interaction,
    isButton: () => true,
    customId: "claimTicket",
    reply: interaction.reply.bind(interaction),
  });
}
