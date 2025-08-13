import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import config from "../config/config.js";

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Add a user to this ticket.")
  .addUserOption(o => o.setName("user").setDescription("User to add").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const user = interaction.options.getUser("user", true);
  await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, AttachFiles: true }).catch(() => {});
  await interaction.reply({ content: `Added <@${user.id}> to this ticket.` });
}
