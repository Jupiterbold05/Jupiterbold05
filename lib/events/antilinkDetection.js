const { getLinkDetectionMode } = require("../linkDetection");
const { incrementWarning, resetWarning } = require("../warnings");

const CREATOR_NUMBER = "2348084644182@s.whatsapp.net"; // your JID here

const setupLinkDetection = (sock) => {
  const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363331568912110@newsletter',
      newsletterName: 'PLATINUM-V2 UPDATES',
      serverMessageId: 143
    }
  };

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const message of messages) {
      const groupJid = message.key.remoteJid;
      if (!groupJid.endsWith("@g.us") || message.key.fromMe) continue;

      const mode = getLinkDetectionMode(groupJid);
      if (!mode) continue;

      const msgText =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";

      const linkRegex = /(?:https?:\/\/(?:chat\.whatsapp\.com\/[^\s]+|wa\.me\/qr\/[^\s]+)|(?:https?:\/\/|www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
      if (!linkRegex.test(msgText)) continue;

      console.log(`🔗 Detected link in group ${groupJid}: ${msgText}`);

      const participant = message.key.participant || message.participant || message.key.remoteJid;
      const username =
        message.pushName ||
        message.message?.senderName ||
        participant?.split("@")[0] ||
        "user";

      const groupMetadata = await sock.groupMetadata(groupJid);
      const groupName = groupMetadata.subject || "this group";
      const isAdmin = groupMetadata.participants.some(
        (member) => member.id === participant && member.admin
      );

      if (isAdmin) {
        console.log(`✅ Ignoring admin: ${participant}`);
        continue;
      }

      await sock.sendMessage(groupJid, { delete: message.key });

      if (mode === "warn") {
        const warningCount = incrementWarning(groupJid, participant);
        await sock.sendMessage(
          groupJid,
          {
            text: `*${username}*, 
> 𝙻𝚒𝚗𝚔𝚜 𝚊𝚛𝚎 𝚗𝚘𝚝 𝚊𝚕𝚕𝚘𝚠𝚎𝚍 𝚑𝚎𝚛𝚎 𝚢𝚘𝚞 𝚜𝚝𝚞𝚙𝚒𝚍 𝚏𝚘𝚘𝚕 😾!\n⚠ Warning: ${warningCount}/3`,
            mentions: [participant],
            contextInfo: newsletterContext
          }
        );

        if (warningCount >= 3) {
          await sock.groupParticipantsUpdate(groupJid, [participant], "remove");
          await sock.sendMessage(
            groupJid,
            {
              text: `@${participant.split("@")[0]} (*${username}*) 
> This fool has been removed for repeatedly sending links 🤡.`,
              mentions: [participant],
              contextInfo: newsletterContext
            }
          );
          await sock.sendMessage(
            CREATOR_NUMBER,
            {
              text: `🚨 Removed *${username}* (@${participant.split("@")[0]}) from *${groupName}* for spamming links.`,
              mentions: [participant]
            }
          );
          resetWarning(groupJid, participant);
        }
      } else if (mode === "kick") {
        await sock.groupParticipantsUpdate(groupJid, [participant], "remove");
        await sock.sendMessage(
          groupJid,
          {
            text: `@${participant.split("@")[0]} (*${username}*)
> 𝚃𝚑𝚎 𝚋𝚊𝚜𝚝𝚊𝚛𝚍 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚛𝚎𝚖𝚘𝚟𝚎𝚍 𝚏𝚘𝚛 𝚜𝚎𝚗𝚍𝚒𝚗𝚐 𝚕𝚒𝚗𝚔𝚜 ✅.`,
            mentions: [participant],
            contextInfo: newsletterContext
          }
        );
        await sock.sendMessage(
          CREATOR_NUMBER,
          {
            text: `🚨 Removed *${username}* (@${participant.split("@")[0]}) from *${groupName}* for sending links.`,
            mentions: [participant]
          }
        );
      }
    }
  });
};

module.exports = { setupLinkDetection };