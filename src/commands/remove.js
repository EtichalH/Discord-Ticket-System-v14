import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Remove a user from this ticket.")
  .addUserOption(o => o.setName("user").setDescription("User to remove").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  await interaction.channel.permissionOverwrites.delete(user.id).catch(() => {});
  await interaction.reply({ content: `Removed <@${user.id}> from this ticket.` });
}
