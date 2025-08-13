import { EmbedBuilder } from "discord.js";
import config from "../config/config.js";

export async function log(client, title, fields = [], color = 0x00FF00) {
  try {
    const channel = await client.channels.fetch(config.channels.logChannelId);
    if (!channel) return console.log("Log channel not found");

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .addFields(fields)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Failed to send log:", err);
  }
}
