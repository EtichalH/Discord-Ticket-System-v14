import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Open a new ticket.");

export async function execute(interaction) {
  const modal = new ModalBuilder()
    .setTitle("Open a Ticket")
    .setCustomId("modal:openTicket");
  const subject = new TextInputBuilder()
    .setCustomId("subject")
    .setLabel("Subject")
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(64)
    .setStyle(TextInputStyle.Short);
  const body = new TextInputBuilder()
    .setCustomId("body")
    .setLabel("Describe your issue")
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(1000)
    .setStyle(TextInputStyle.Paragraph);
  modal.addComponents(
    new ActionRowBuilder().addComponents(subject),
    new ActionRowBuilder().addComponents(body)
  );
  await interaction.showModal(modal);
}
