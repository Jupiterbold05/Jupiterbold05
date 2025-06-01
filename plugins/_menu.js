const config = require('../config'); const { cmd, commands } = require('../command'); const { formatBytes, getLocalBuffer, runtime, tiny, getBuffer } = require('../lib/functions'); const { platform, totalmem, freemem } = require('os'); const { join } = require('path');

// MENU COMMAND 
cmd( 
    { pattern: 'menu', 
      desc: 'Show all commands', 
      category: 'main', 
      filename: __filename }, 
    async (conn, mek, m, { from, pushname, reply }) => { try { const botName = config.BOT_INFO ? config.BOT_INFO.split(';')[1] || 'Platinum-V2' : 'Platinum-V2'; const dateTime = new Date().toLocaleString();

let menuText = `╭─❏ *${botName}* ❏\n` +
    `│ User: ${pushname}\n` +
    `│ Mode: ${config.MODE}\n` +
    `│ Uptime: ${runtime(process.uptime())}\n` +
    `│ Date/Time: ${dateTime}\n` +
    `│ Platform: ${platform()}\n` +
    `│ Memory: ${formatBytes(totalmem() - freemem())}\n` +
    `│ Plugins: ${commands.length}\n` +
    `│ Version: ${config.VERSION}\n` +
    `╰──────────────❏\n`;

  const categorized = {};
  commands.forEach(cmdItem => {
    if (!cmdItem.pattern || cmdItem.dontAddCommandList) return;
    const name = cmdItem.pattern;
    const cat = (cmdItem.category || 'misc').toLowerCase();
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(name);
  });

  Object.keys(categorized).forEach(cat => {
    menuText += `\n╭── ❏ *${cat.toUpperCase()}* ❏\n`;
    categorized[cat].forEach(name => {
      menuText += `│ ❍ ${name}\n`;
    });
    menuText += `╰──────────────❏\n`;
  });

  const image = await getLocalBuffer(join(process.cwd(), './media/thumb.jpg'));

  await conn.sendMessage(
    from,
    {
      image,
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363331568912110@newsletter',
          newsletterName: '𝙿𝚕𝚊𝚝𝚒𝚗𝚞𝚖-𝚅2',
          serverMessageId: 143
        }
      }
    },
    { quoted: mek }
  );
} catch (error) {
  console.error(error);
  reply('An error occurred while generating the menu.');
}

} );

// HELP COMMAND 
cmd(
  {
    pattern: 'help',
    desc: 'xstro support',
    category: 'user',
    filename: __filename,
  },
  async (conn, mek, m) => {
    try {
      // Tiny function to convert text into small/superscript-like letters
      function tiny(text) {
        const tinyChars = {
          a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ',
          h: 'ʰ', i: 'ᶦ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ',
          o: 'ᵒ', p: 'ᵖ', q: 'q', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ',
          v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
          A: 'ᴬ', B: 'ᴮ', C: 'ᶜ', D: 'ᴰ', E: 'ᴱ', F: 'ᶠ', G: 'ᴳ',
          H: 'ᴴ', I: 'ᴵ', J: 'ᴶ', K: 'ᴷ', L: 'ᴸ', M: 'ᴹ', N: 'ᴺ',
          O: 'ᴼ', P: 'ᴾ', Q: 'Q', R: 'ᴿ', S: 'ˢ', T: 'ᵀ', U: 'ᵁ',
          V: 'ⱽ', W: 'ᵂ', X: 'ˣ', Y: 'ʸ', Z: 'ᶻ',
          ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?'
        };
        return [...text].map(c => tinyChars[c] || c).join('');
      }

      const name = tiny('Jupiter');
      const title = tiny('Jupiter support');
      const number = '2348084644182';
      const body = tiny('Jupiter');
      const imageUrl = 'https://avatars.githubusercontent.com/u/183214515?v=4';
      const sourceUrl = 'https://github.com/Jupiterbold05/Platinum-v1';

      // Placeholder getBuffer function — replace with actual implementation
      const getBuffer = async (url) => {
        const axios = require('axios');
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(res.data, 'binary');
      };

      const logo = await getBuffer(imageUrl);

      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:made by astro;
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD`;

      const info = {
        title,
        body,
        thumbnail: logo,
        mediaType: 1,
        mediaUrl: sourceUrl,
        sourceUrl,
        showAdAttribution: true,
        renderLargerThumbnail: false,
      };

      await conn.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: name,
            contacts: [{ vcard }],
          },
          contextInfo: { externalAdReply: info },
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error(error);
      await conn.sendMessage(
        m.chat,
        { text: 'An error occurred while sending support info.' },
        { quoted: mek }
      );
    }
  }
);
