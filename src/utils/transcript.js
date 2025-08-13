import { AttachmentBuilder } from "discord.js";
import fs from "fs-extra";
import path from "path";

export async function buildTranscript(channel, { guildLogo = "" } = {}) {
  const limit = 1000; // up to 1000 messages
  let messages = [];
  let lastId = undefined;
  while (messages.length < limit) {
    const batch = await channel.messages.fetch({ limit: 100, before: lastId }).catch(() => null);
    if (!batch || batch.size === 0) break;
    messages.push(...[...batch.values()]);
    lastId = batch.last().id;
  }
  messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const html = `<!doctype html><html><head>
<meta charset="utf-8"/>
<title>Transcript - ${channel.name}</title>
<style>
body{font-family: ui-sans-serif,system-ui,Segoe UI,Roboto,Ubuntu,sans-serif;background:#0b0d10;color:#e6e6e6;margin:0;padding:24px;}
.wrap{max-width:960px;margin:auto;}
.msg{padding:10px 12px;border-bottom:1px solid #1f2328;}
.meta{opacity:.7;font-size:12px;margin-bottom:4px;}
.content{white-space:pre-wrap;word-wrap:break-word;}
.attach a{color:#8ab4f8;text-decoration:none}
.author{font-weight:600}
.header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.header img{width:36px;height:36px;border-radius:6px;}
.badge{padding:2px 8px;background:#1f2328;border-radius:999px;font-size:12px;}
</style>
</head><body><div class="wrap">
<div class="header">
  ${guildLogo ? `<img src="${guildLogo}">` : ""}
  <h2>Transcript — ${channel.name}</h2>
  <span class="badge">${new Date().toLocaleString()}</span>
</div>
${messages.map(m => `
<div class="msg">
  <div class="meta"><span class="author">${m.author?.tag ?? "Unknown"}</span> • ${new Date(m.createdTimestamp).toLocaleString()}</div>
  <div class="content">${escapeHtml(m.content || "")}</div>
  ${m.attachments.size ? `<div class="attach">${[...m.attachments.values()].map(a => `<div>Attachment: <a href="${a.url}">${a.name}</a></div>`).join("")}</div>` : ""}
</div>`).join("")}
</div></body></html>`;

  const filePath = path.join(process.cwd(), "transcripts", `${channel.id}.html`);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, html, "utf8");
  return new AttachmentBuilder(filePath, { name: `${channel.name}-transcript.html` });
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
