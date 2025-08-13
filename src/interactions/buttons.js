import { PermissionFlagsBits, ChannelType, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } from "discord.js";
import config from "../config/config.js";
import { getRecord, setRecord, removeRecord } from "../utils/tickets.js";
import { buildTranscript } from "../utils/transcript.js";
import { log } from "../utils/logger.js";
import { deleteCooldown } from "../utils/cooldown.js"; // we'll create this function

export async function handleButton(interaction, client) {
  const [kind, ...rest] = interaction.customId.split(":");

  if (kind === "openTicket") return openTicket(interaction);
  if (kind === "claimTicket") return claim(interaction, client);
  if (kind === "unclaimTicket") return unclaim(interaction, client);
  if (kind === "lockTicket") return lock(interaction, true);
  if (kind === "unlockTicket") return lock(interaction, false);
  if (kind === "closeTicket") return closeTicket(interaction, client);
  if (kind === "renameTicket") return rename(interaction);
}

async function openTicket(interaction) {
  const modal = {
    title: "Open a Ticket",
    custom_id: "modal:openTicket",
    components: [
      {
        type: 1, components: [{
          type: 4, custom_id: "subject", style: 1, label: "Subject",
          min_length: 3, max_length: 64, required: true, placeholder: "e.g. Game Breaking issue"
        }]
      },
      {
        type: 1, components: [{
          type: 4, custom_id: "body", style: 2, label: "Describe your issue",
          min_length: 10, max_length: 1000, required: true, placeholder: "Give us details so we can help faster."
        }]
      }
    ]
  };
  return interaction.showModal(modal);
}

async function claim(interaction, client) {
  const rec = await getRecord(interaction.channelId);
  if (!rec) return interaction.reply({ content: "Not a ticket channel.", ephemeral: true });

  if (!interaction.member.roles.cache.has(config.roles.staffRoleId))
    return interaction.reply({ content: "Only staff can claim.", ephemeral: true });

  if (rec.claimedBy) {
    if (rec.claimedBy === interaction.user.id)
      return interaction.reply({ content: "You already claimed this ticket.", ephemeral: true });
  }

  await setRecord(interaction.channelId, { claimedBy: interaction.user.id });
  await interaction.reply({ embeds: [new EmbedBuilder()
    .setColor(config.colors.success).setDescription(`🧷 Ticket claimed by <@${interaction.user.id}>`)] });

  await log(client, "Ticket Claimed", [
    { name: "Channel", value: `<#${interaction.channelId}>`, inline: true },
    { name: "By", value: `<@${interaction.user.id}>`, inline: true }
  ], config.colors.success);
}

async function unclaim(interaction, client) {
  const rec = await getRecord(interaction.channelId);
  if (!rec) return interaction.reply({ content: "Not a ticket channel.", ephemeral: true });
  if (!interaction.member.roles.cache.has(config.roles.staffRoleId))
    return interaction.reply({ content: "Only staff can unclaim.", ephemeral: true });

  if (!rec.claimedBy) return interaction.reply({ content: "This ticket is not claimed.", ephemeral: true });

  if (rec.claimedBy !== interaction.user.id &&
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({ content: "Only the claimer or a manager can unclaim.", ephemeral: true });
  }

  await setRecord(interaction.channelId, { claimedBy: null });
  await interaction.reply({ embeds: [new EmbedBuilder()
    .setColor(config.colors.warning).setDescription(`🧷 Ticket unclaimed.`)] });

  await log(client, "Ticket Unclaimed", [
    { name: "Channel", value: `<#${interaction.channelId}>`, inline: true },
    { name: "By", value: `<@${interaction.user.id}>`, inline: true }
  ], config.colors.warning);
}

async function lock(interaction, lock) {
  const rec = await getRecord(interaction.channelId);
  if (!rec) return interaction.reply({ content: "Not a ticket channel.", ephemeral: true });
  if (!interaction.member.roles.cache.has(config.roles.staffRoleId))
    return interaction.reply({ content: "Only staff can do that.", ephemeral: true });

  const chan = interaction.channel;
  await chan.permissionOverwrites.edit(rec.openerId, { SendMessages: !lock, ViewChannel: true }).catch(() => {});
  await setRecord(interaction.channelId, { locked: lock });

  return interaction.reply({ embeds: [new EmbedBuilder()
    .setColor(lock ? config.colors.danger : config.colors.success)
    .setDescription(`${lock ? "🔒" : "🔓"} Ticket ${lock ? "locked" : "unlocked"}.`)] });
}

// -------------------- CLOSE TICKET --------------------
async function closeTicket(interaction, client) {
  const rec = await getRecord(interaction.channelId);
  if (!rec) return interaction.reply({ content: "Not a ticket channel.", ephemeral: true });

  const isStaff = interaction.member.roles.cache.has(config.roles.staffRoleId);
  const isOpener = rec.openerId === interaction.user.id;
  if (!isStaff && !isOpener)
    return interaction.reply({ content: "Only staff or the opener can close.", ephemeral: true });

  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;

  // Move to closed category
  await channel.setParent(config.categories.closedCategoryId, { lockPermissions: true }).catch(() => {});
  await channel.edit({ name: channel.name.replace(/^ticket/, "closed") }).catch(() => {});

  // Build transcript
  const file = await buildTranscript(channel);

  // Post transcript in channel and logs
  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle("📁 Ticket Archived")
        .setDescription("This ticket has been archived. A transcript has been generated.")
    ],
    files: [file]
  }).catch(() => {});

  await log(client, "Ticket Closed", [
    { name: "Channel", value: `<#${channel.id}>`, inline: true },
    { name: "Closed By", value: `<@${interaction.user.id}>`, inline: true },
    { name: "Opener", value: `<@${rec.openerId}>`, inline: true }
  ], config.colors.warning);

  // Update ticket record to mark it as closed
  await setRecord(channel.id, { closedAt: Date.now(), locked: true });

  // DELETE user from tickets.json and cooldowns.json
  await removeRecord(channel.id);          // removes ticket from tickets.json
  await deleteCooldown(rec.openerId);     // remove user's cooldowns

  // Reply to user
  await interaction.followUp({ content: "Ticket closed :rocket:, ticket information been saved for safety mesures .", ephemeral: true });
}


// -------------------- RENAME --------------------
async function rename(interaction) {
  const modal = {
    title: "Rename Ticket",
    custom_id: "modal:renameTicket",
    components: [
      {
        type: 1, components: [{
          type: 4, custom_id: "newname", style: 1, label: "New channel name",
          min_length: 3, max_length: 48, required: true, placeholder: "closed-ticket-0123"
        }]
      }
    ]
  };
  return interaction.showModal(modal);
}
