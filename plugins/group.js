const config = require("../config");
const { cmd, commands } = require("../command");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// Helper function to convert a stream to a Buffer.
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

cmd(
  {
    pattern: "add",
    desc: "Adds a person to group",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");
      if (!args[0] && !quoted) return reply("_Mention user to add_");

      let jid = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
      await conn.groupParticipantsUpdate(from, [jid], "add");
      return reply(`@${jid.split("@")[0]} added`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "promote",
    desc: "Promotes a member",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");
      if (!args[0] && !quoted) return reply("_Mention user to promote_");

      let jid = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
      await conn.groupParticipantsUpdate(from, [jid], "promote");
      return reply(`@${jid.split("@")[0]} promoted as admin`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "demote",
    desc: "Demotes a member",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");
      if (!args[0] && !quoted) return reply("_Mention user to demote_");

      let jid = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
      await conn.groupParticipantsUpdate(from, [jid], "demote");
      return reply(`@${jid.split("@")[0]} demoted from admin`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "mute",
    desc: "Mutes the group",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");

      await conn.groupSettingUpdate(from, "announcement");
      return reply("_Group has been muted_");
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "unmute",
    desc: "Unmutes the group",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");

      await conn.groupSettingUpdate(from, "not_announcement");
      return reply("_Group has been unmuted_");
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "gjid",
    desc: "Gets JIDs of all group members",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");

      let participantJids = groupMetadata.participants.map((p) => p.id);
      let str = "╭──〔 *Group JIDs* 〕\n";
      participantJids.forEach((jid) => {
        str += `├ *${jid}*\n`;
      });
      str += `╰──────────────`;
      return reply(str);
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "tagall",
    desc: "Mentions all users in the group",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata, sender, args }) => {
    try {
      if (!isGroup) return reply("🚫 *This command can only be used in groups!*");

      // Fetch admins properly
      let admins = groupMetadata.participants.filter((p) => p.admin).map((p) => p.id);
      let isAdmin = admins.includes(sender);

      if (!isAdmin) return reply("⚠️ *Only group admins can use this command!*");

      let mentions = groupMetadata.participants.map((p) => p.id);
      let message = args.length > 0 ? args.slice(1).join(" ") : "✨ *No message provided!* ✨";
      let senderName = groupMetadata.participants.find((p) => p.id === sender)?.name || "Unknown User";

      let text = `╔═══════◆◇◆═══════╗
      ✨ *『 PLATINUM-V2 BOT 』* ✨
╚═══════◆◇◆═══════╝

👤 *Sent by:* @${sender.split("@")[0]}
📢 *Message:* ${message}

🎉 *Summoning all group members:* 🎉
${mentions
  .map((jid, index) => `💠 *[${index + 1}]*  ➜ @${jid.split("@")[0]} 👀`)
  .join("\n")}

💬 *Stay active and have fun!* 🚀`;

     
      return await conn.sendMessage(from, { text, mentions });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);


cmd(
  {
    pattern: "tag",
    desc: "Mentions all users with a custom message (and resends media if available)",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return;
      let messageText = args.join(" ").trim();
      if (messageText.toLowerCase().startsWith("tag")) {
        messageText = messageText.substring(3).trim();
      }
      let mediaMsg = null;
      if (m.quoted) {
        const quoted = m.quoted;
        messageText =
          messageText ||
          quoted.conversation ||
          quoted.extendedTextMessage?.text ||
          quoted.imageMessage?.caption ||
          quoted.videoMessage?.caption ||
          "";
        if (
          quoted.imageMessage ||
          quoted.videoMessage ||
          quoted.audioMessage ||
          quoted.documentMessage ||
          quoted.stickerMessage ||
          quoted.pollCreationMessage
        ) {
          mediaMsg = quoted;
        }
      }
      if (!messageText && !mediaMsg) {
        return reply("_Provide a message to send with mentions_");
      }
      const mentions = groupMetadata.participants.map((p) => p.id);
      if (mediaMsg) {
        let mediaBuffer;
        if (mediaMsg.imageMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.imageMessage, "image");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { image: mediaBuffer, caption: messageText, mentions }, { quoted: m });
        } else if (mediaMsg.videoMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.videoMessage, "video");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { video: mediaBuffer, caption: messageText, mentions }, { quoted: m });
        } else if (mediaMsg.audioMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.audioMessage, "audio");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(
            from,
            { audio: mediaBuffer, mimetype: mediaMsg.audioMessage.mimetype || "audio/ogg", ptt: true },
            { quoted: m }
          );
        } else if (mediaMsg.documentMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.documentMessage, "document");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { document: mediaBuffer, caption: messageText, mentions }, { quoted: m });
        } else if (mediaMsg.stickerMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.stickerMessage, "sticker");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { sticker: mediaBuffer, mentions }, { quoted: m });
        } else if (mediaMsg.pollCreationMessage) {
          if (messageText) {
            await conn.sendMessage(from, { text: messageText, mentions }, { quoted: m });
          }
          await conn.copyNForward(from, mediaMsg, true);
        } else {
          await conn.sendMessage(from, { text: messageText, mentions }, { quoted: m });
        }
      } else {
        await conn.sendMessage(from, { text: messageText, mentions }, { quoted: m });
      }
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// New hidetag command – works like tag but sends a stand-alone message (no reply)
cmd(
  {
    pattern: "hidetag",
    desc: "Mentions all users with a custom message (without replying)",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return;
      let messageText = args.join(" ").trim();
      // Remove the command keyword if accidentally included.
      if (messageText.toLowerCase().startsWith("hidetag")) {
        messageText = messageText.substring(7).trim();
      }
      let mediaMsg = null;
      if (m.quoted) {
        const quoted = m.quoted;
        messageText =
          messageText ||
          quoted.conversation ||
          quoted.extendedTextMessage?.text ||
          quoted.imageMessage?.caption ||
          quoted.videoMessage?.caption ||
          "";
        if (
          quoted.imageMessage ||
          quoted.videoMessage ||
          quoted.audioMessage ||
          quoted.documentMessage ||
          quoted.stickerMessage ||
          quoted.pollCreationMessage
        ) {
          mediaMsg = quoted;
        }
      }
      if (!messageText && !mediaMsg) {
        return reply("_Provide a message to send with mentions_");
      }
      const mentions = groupMetadata.participants.map((p) => p.id);
      if (mediaMsg) {
        let mediaBuffer;
        if (mediaMsg.imageMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.imageMessage, "image");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { image: mediaBuffer, caption: messageText, mentions });
        } else if (mediaMsg.videoMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.videoMessage, "video");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { video: mediaBuffer, caption: messageText, mentions });
        } else if (mediaMsg.audioMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.audioMessage, "audio");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { audio: mediaBuffer, mimetype: mediaMsg.audioMessage.mimetype || "audio/ogg", ptt: true });
        } else if (mediaMsg.documentMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.documentMessage, "document");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { document: mediaBuffer, caption: messageText, mentions });
        } else if (mediaMsg.stickerMessage) {
          const stream = await downloadContentFromMessage(mediaMsg.stickerMessage, "sticker");
          mediaBuffer = await streamToBuffer(stream);
          await conn.sendMessage(from, { sticker: mediaBuffer, mentions });
        } else if (mediaMsg.pollCreationMessage) {
          if (messageText) {
            await conn.sendMessage(from, { text: messageText, mentions });
          }
          await conn.copyNForward(from, mediaMsg, true);
        } else {
          await conn.sendMessage(from, { text: messageText, mentions });
        }
      } else {
        await conn.sendMessage(from, { text: messageText, mentions });
      }
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// New everyone command – tags everyone to a particular message (as a reply) without listing them in the message body
cmd(
  {
    pattern: "everyone",
    desc: "Tags everyone with a custom message",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("*This command is for groups*");
      let messageText = args.join(" ").trim();
      if (!messageText) return reply("Please provide a message to send.");
      const mentions = groupMetadata.participants.map((p) => p.id);
      // Send the message as a reply to the original command.
      await conn.sendMessage(from, { text: messageText, mentions }, { quoted: m });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd({
  pattern: "kick",
  desc: "Kicks replied/quoted user from group.",
  category: "group",
  filename: __filename,
  use: "<quote|reply|number>"
}, async (conn, mek, m, { 
  from, quoted, args, isGroup, isBotAdmins, isAdmins, reply 
}) => {
  if (!isGroup) {
    return reply("This command can only be used in groups.");
  }
  
  if (!isAdmins) {
    return reply("Only group admins can use this command.");
  }

  try {
    let users = quoted 
      ? quoted.sender 
      : args[0] 
        ? args[0].includes("@") 
          ? args[0].replace(/[@]/g, "") + "@s.whatsapp.net" 
          : args[0] + "@s.whatsapp.net" 
        : null;

    if (!users) {
      return reply("Please reply to a message or provide a valid number.");
    }

    await conn.groupParticipantsUpdate(from, [users], "remove");
    reply("User has been removed from the group successfully.");
  } catch (error) {
    console.error("Error kicking user:", error);
    reply("Failed to remove the user. Ensure I have the necessary permissions.");
  }
});