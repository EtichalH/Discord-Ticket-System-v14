import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from "discord.js";
import config from "../config/config.js";

export const data = new SlashCommandBuilder()
  .setName("panel")
  .setDescription("Post the ticket creation panel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle("Need help or you have questions?")
	  .setURL("https://google.com/")
    .setDescription("Click **Open Ticket** to contact our team [_Name of team if there is_]. Provide a clear subject and details in the modal that appears.\n- If we see that you brake tickets rules you will be timeout for **3 days**\n- Who responds: @Moderators ")
    .setFooter({ text: "We usually reply quickly. Please be patient. 💬", iconURL: 'https://i.imgur.com/N9tGoAF.jpeg'  })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("openTicket").setLabel("Open Ticket").setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}
