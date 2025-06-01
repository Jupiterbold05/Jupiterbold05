const config = require("../config");
const { cmd, commands } = require("../command");
const fetch = require("node-fetch");
const sharp = require("sharp");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");

// Helper function to convert a stream to a Buffer.
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

//
// Existing Commands
//

cmd(
  {
    pattern: "couple",
    desc: "Pairs two random group members as a couple 💞",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("🚫 *This command can only be used in groups!*");

      let members = groupMetadata.participants.map((p) => p.id);
      if (members.length < 2) return reply("❌ *Not enough members to pair!*");

      let [p1, p2] = members.sort(() => Math.random() - 0.5).slice(0, 2);

      let text = `💘 *Perfect Match Alert!* 💘\n\n❤️ *@${p1.split("@")[0]}* 💞 *@${p2.split("@")[0]}* ❤️\n\n👀 *Made for each other?* 🤭🔥`;

      return await conn.sendMessage(from, { text, mentions: [p1, p2] }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

cmd(
  {
    pattern: "king",
    desc: "Randomly selects a group king 👑",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("🚫 *This command can only be used in groups!*");

      let members = groupMetadata.participants.map((p) => p.id);
      if (members.length < 1) return reply("❌ *Not enough members!*");

      let king = members[Math.floor(Math.random() * members.length)];

      let text = `👑 *Bow down to the new King!* 👑\n\n🥶 *@${king.split("@")[0]}* now rules this group! 🤴🔥`;

      return await conn.sendMessage(from, { text, mentions: [king] }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

cmd(
  {
    pattern: "roast",
    desc: "Roasts a random group member 🔥",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("🚫 *This command can only be used in groups!*");

      let roasts = [
        "Bro, even Google can't find your relevance. 📉",
        "You bring everyone together... when you leave the chat. 😭",
        "You're proof that even mistakes can be consistent. 🤡",
        "I’d agree with you, but then we’d both be wrong. 😂",
      ];

      let members = groupMetadata.participants.map((p) => p.id);
      if (members.length < 1) return reply("❌ *Not enough members!*");

      let victim = members[Math.floor(Math.random() * members.length)];
      let roastMessage = roasts[Math.floor(Math.random() * roasts.length)];

      let text = `🔥 *Roast Time!* 🔥\n\n🤡 *@${victim.split("@")[0]}*, ${roastMessage}`;

      return await conn.sendMessage(from, { text, mentions: [victim] }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

cmd(
  {
    pattern: "tod",
    desc: "Gives a random Truth or Dare challenge 🎭",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup }) => {
    try {
      if (!isGroup) return reply("🚫 *This command can only be used in groups!*");

      let truths = [
        "What’s your biggest secret? 🤫",
        "Have you ever had a crush on someone in this group? 😏",
        "What's the most embarrassing thing you've done? 😆",
      ];

      let dares = [
        "Send a love confession to the first person in your chat. 💌",
        "Talk like a baby for the next 5 messages. 👶",
        "Send a selfie making the weirdest face. 🤪",
      ];

      let choice = Math.random() > 0.5 ? "Truth" : "Dare";
      let challenge = choice === "Truth" ? truths[Math.floor(Math.random() * truths.length)] : dares[Math.floor(Math.random() * dares.length)];

      let text = `🎭 *Truth or Dare!* 🎭\n\n🤔 *You got:* *${choice}*\n👉 ${challenge}`;

      return await conn.sendMessage(from, { text }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

cmd(
  {
    pattern: "kickrandom",
    desc: "Randomly kicks a member 😈",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("🚫 *This command can only be used in groups!*");

      let admins = groupMetadata.participants.filter((p) => p.admin).map((p) => p.id);
      let isAdmin = admins.includes(m.sender);
      if (!isAdmin) return reply("⚠️ *Only admins can use this command!*");

      let members = groupMetadata.participants.filter((p) => !p.admin).map((p) => p.id);
      if (members.length < 1) return reply("❌ *No kickable members found!*");

      let unlucky = members[Math.floor(Math.random() * members.length)];

      await conn.groupParticipantsUpdate(from, [unlucky], "remove");

      let text = `😈 *Random Kick Activated!* 🚀\n\n💀 *@${unlucky.split("@")[0]}* has been banished from the group! ☠️`;

      return await conn.sendMessage(from, { text, mentions: [unlucky] }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

cmd(
  {
    pattern: "couplepp",
    category: "search",
    desc: "Sends two couple profile pictures.",
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    try {
      // Use axios to fetch the JSON data from GitHub.
      const response = await axios.get("https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json");
      let anu = response.data;
      
      // Check that we have a valid non-empty array.
      if (!Array.isArray(anu) || anu.length === 0) {
        return reply("Uhh dear, Couldn't get any results!");
      }
      
      // Pick a random object.
      let random = anu[Math.floor(Math.random() * anu.length)];
      
      // Verify that the object has both male and female image URLs.
      if (!random.male || !random.female) {
        return reply("Uhh dear, Couldn't get any results!");
      }
      
      // Send the male image.
      await conn.sendMessage(m.chat, { 
        image: { url: random.male }, 
        caption: "*✦For Him 👑👑✦*" 
      });
      
      // Send the female image.
      await conn.sendMessage(m.chat, { 
        image: { url: random.female }, 
        caption: "*✦For Her ❤️❤️✦*" 
      });
    } catch (e) {
      console.log(e);
      return reply("Uhh dear, Couldn't get any results!");
    }
  }
);

//
// New Commands: setpp and fullpp (for updating the sender's profile picture)
//

// Command: setpp - Sets the replied image as your (sender's) profile picture.
cmd(
  {
    pattern: "setpp",
    desc: "Sets the replied image as your profile picture",
    category: "profile",
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    try {
      if (!m.quoted || !m.quoted.imageMessage)
        return reply("Please reply to an image to set as your profile picture.");
      
      // Download the image using downloadContentFromMessage.
      const stream = await downloadContentFromMessage(m.quoted.imageMessage, "image");
      const buffer = await streamToBuffer(stream);
      
      // Update the sender's profile picture using m.sender.
      await conn.updateProfilePicture(m.sender, buffer);
      return reply("✅ *Profile picture updated successfully!*");
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

// Command: fullpp - Adjusts the replied image so the full image fits as your profile picture.
cmd(
  {
    pattern: "fullpp",
    desc: "Sets the replied image as your profile picture after adjusting its resolution to fit fully",
    category: "profile",
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    try {
      if (!m.quoted || !m.quoted.imageMessage)
        return reply("Please reply to an image to set as your profile picture.");
      
      // Download the image using downloadContentFromMessage.
      const stream = await downloadContentFromMessage(m.quoted.imageMessage, "image");
      const buffer = await streamToBuffer(stream);
      
      // Use sharp to adjust the image.
      const adjustedBuffer = await sharp(buffer)
        .resize(640, 640, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background.
        })
        .toBuffer();
      
      // Update the sender's profile picture using m.sender.
      await conn.updateProfilePicture(m.sender, adjustedBuffer);
      return reply("✅ *Profile picture updated with full image adjustment successfully!*");
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);