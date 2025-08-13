import { ChannelType, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "../config/config.js";
import { createRecord, countOpenFor } from "../utils/tickets.js";
import { isOnCooldown, putCooldown } from "../utils/cooldown.js";
import { log } from "../utils/logger.js";

export async function handleModal(interaction, client) {
  const [kind] = interaction.customId.split(":");

  if (kind === "modal") {
    const sub = interaction.customId.split(":")[1];
    if (sub === "openTicket") return createTicketFromModal(interaction, client);
    if (sub === "renameTicket") return renameTicketFromModal(interaction);
  }
}

async function createTicketFromModal(interaction, client) {
  const subject = interaction.fields.getTextInputValue("subject");
  const body = interaction.fields.getTextInputValue("body");

  // cooldown & open count
  const remaining = await isOnCooldown(interaction.user.id, "create", config.limits.createCooldownMs);
  if (remaining) return interaction.reply({ content: `Please wait ${(Math.ceil(remaining/1000))}s before creating another ticket.`, ephemeral: true });

  const openCnt = await countOpenFor(interaction.user.id);
  if (openCnt >= config.limits.userOpenTicketLimit)
    return interaction.reply({ content: `You already have ${openCnt} open ticket(s).`, ephemeral: true });

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const name = `${config.ticket.namePrefix}-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12)}-${Math.floor(Math.random()*900)+100}`;
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
    { id: config.roles.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
  ];

  const channel = await guild.channels.create({
    name,
    parent: config.categories.openCategoryId,
    type: ChannelType.GuildText,
    topic: `Subject: ${subject} | Opened by ${interaction.user.tag} (${interaction.user.id})`,
    permissionOverwrites: overwrites
  });

  // Starter message with controls
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(`🎫 ${subject}`)
    .setDescription(`**From:** <@${interaction.user.id}>\n**Subject**: \`\`\`${body}\`\`\`\n-# ⚠️ Please be patient and be kind to our team! <3 `)
    .setTimestamp()
    .setFooter({ text: "Use the buttons below to manage this ticket." });

const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("claimTicket").setStyle(ButtonStyle.Primary).setLabel("Claim"),
    new ButtonBuilder().setCustomId("renameTicket").setStyle(ButtonStyle.Secondary).setLabel("Rename"),
    new ButtonBuilder().setCustomId("lockTicket").setStyle(ButtonStyle.Secondary).setLabel("Lock"),
    new ButtonBuilder().setCustomId("archiveTicket").setStyle(ButtonStyle.Secondary).setLabel("Archive"),
    new ButtonBuilder().setCustomId("closeTicket").setStyle(ButtonStyle.Danger).setLabel("Close")
);


  await channel.send({ content: config.ticket.mentionStaffOnOpen ? `<@&${config.roles.staffRoleId}>` : null, embeds: [embed], components: [controls] });
  await createRecord({ channelId: channel.id, openerId: interaction.user.id, subject });

  await log(client, "Ticket Opened", [
    { name: "Channel", value: `<#${channel.id}>`, inline: true },
    { name: "Subject", value: subject, inline: true },
    { name: "Opened By", value: `<@${interaction.user.id}>`, inline: true }
  ], config.colors.primary);

  await putCooldown(interaction.user.id, "create", config.limits.createCooldownMs);
  return interaction.editReply({ content: `Ticket created: <#${channel.id}>` });
}

async function renameTicketFromModal(interaction) {
  const newName = interaction.fields.getTextInputValue("newname").toLowerCase();
  if (!interaction.member.roles.cache.has(config.roles.staffRoleId))
    return interaction.reply({ content: "Only staff can rename tickets.", ephemeral: true });

  await interaction.channel.edit({ name: newName }).catch(() => {});
  return interaction.reply({ embeds: [new EmbedBuilder().setColor(config.colors.success).setDescription(`✏️ Renamed to **${newName}**`)] });
}
