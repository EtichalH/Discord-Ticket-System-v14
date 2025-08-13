import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import config from "../config/config.js";

const ticketsFile = fileURLToPath(new URL("../data/tickets.json", import.meta.url));

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Show ticket system statistics");

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const db = await loadTickets();

  // Total tickets ever created
  const totalTickets = Object.keys(db.byChannel).length;

  // Count open tickets (not closed)
  const openTickets = Object.values(db.byChannel).filter(t => !t.closedAt).length;

  // Count closed tickets
  const closedTickets = totalTickets - openTickets;

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket System Statistics")
    .setColor(config.colors.primary)
    .addFields(
      { name: "🟢 Open Tickets", value: `${openTickets}`, inline: true },
      { name: "🔴 Closed Tickets", value: `${closedTickets}`, inline: true },
      { name: "📊 Total Tickets", value: `${totalTickets}`, inline: true }
    )
    .setFooter({ text: "Ticket statistics panel" })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function loadTickets() {
  try {
    return JSON.parse(await fs.readFile(ticketsFile, "utf8"));
  } catch {
    return { byChannel: {}, byUserOpen: {} };
  }
}
