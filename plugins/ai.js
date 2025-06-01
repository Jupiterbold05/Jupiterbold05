const { cmd } = require("../command");
const { getJson, getBuffer } = require("../lib/functions");

// Gemini Command
cmd(
  {
    pattern: "gemini",
    alias: "bard",
    desc: "Chat with Google Gemini Ai",
    type: "ai",
    filename: __filename,
  },
  async (conn, mek, m, { reply, prefix }) => {
    if (!m.text)
      return reply(
        `_Hi ${m.sender}_\n\n_${prefix}gemini What is life_`
      );
    const msg = await reply("_Thinking 🤔_");
    const res = await getJson(
      `https://api.giftedtech.my.id/api/ai/geminiai?apikey=astro_fx-k56DdhdS7@gifted_api&q=${encodeURIComponent(
        m.text
      )}`
    );
    return await msg.edit(res.result);
  }
);

// GPT4 Command
cmd(
  {
    pattern: "gpt4",
    alias: "gpt",
    desc: "Query OpenAi Gpt4 Model",
    type: "ai",
    filename: __filename,
  },
  async (conn, mek, m, { reply, prefix }) => {
    if (!m.text)
      return reply(
        `_Hi ${m.sender}_\n\n_${prefix}gpt4 Which Ai Model are you_`
      );
    const msg = await reply("_Deep thought ✍️_");
    const res = await getJson(
      `https://api.giftedtech.my.id/api/ai/gpt4?apikey=astro_fx-k56DdhdS7@gifted_api&q=${encodeURIComponent(
        m.text
      )}`
    );
    return await msg.edit(res.result);
  }
);

// SD Command: Generate images from text
cmd(
  {
    pattern: "sd",
    desc: "Generate images from text",
    type: "ai",
    filename: __filename,
  },
  async (conn, mek, m, { reply, prefix }) => {
    if (!m.text)
      return reply(
        `_Hi ${m.sender}_\n\n_${prefix}sd an image of ironman with batman_`
      );
    const res = await getBuffer(
      `https://api.giftedtech.my.id/api/ai/sd?apikey=astro_fx-k56DdhdS7@gifted_api&prompt=${encodeURIComponent(
        m.text
      )}`
    );
    return await conn.sendMessage(
      m.chat,
      {
        image: res,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363331568912110@newsletter",
            newsletterName: "*𝙿𝚕𝚊𝚝𝚒𝚗𝚞𝚖-𝚅2*",
            serverMessageId: 143,
          },
        },
      },
      { quoted: mek }
    );
  }
);