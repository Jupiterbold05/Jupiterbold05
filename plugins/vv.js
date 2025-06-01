const config = require("../config");
const { cmd, commands } = require("../command");

// Modified "vv" command: Extracts a view once message and sends it to the user's DM as a reply to the view once message.
cmd({
    pattern: "vv",
    desc: "Get view once.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { isReply, quoted, reply }) => {
    try {
        if (!m.quoted) return reply("Please reply to a view once message!");

        const contextInfo = m.message.extendedTextMessage.contextInfo;
        const qmessage = contextInfo.quotedMessage;

        const mediaMessage = qmessage.imageMessage ||
                             qmessage.videoMessage ||
                             qmessage.audioMessage;

        if (!mediaMessage?.viewOnce) return reply("Not a view once message!");

        const buff = await m.quoted.getbuff;
        const cap = mediaMessage.caption || '';

        // Build the full quoted message manually
        const fakeQuoted = {
            key: {
                remoteJid: m.chat,
                fromMe: false,
                id: contextInfo.stanzaId,
                participant: contextInfo.participant
            },
            message: qmessage
        };

        // Send to DM, quoting the original view once message
        if (mediaMessage.mimetype.startsWith('image')) {
            await conn.sendMessage(m.sender, {
                image: buff,
                caption: cap
            }, { quoted: fakeQuoted });
        } else if (mediaMessage.mimetype.startsWith('video')) {
            await conn.sendMessage(m.sender, {
                video: buff,
                caption: cap
            }, { quoted: fakeQuoted });
        } else if (mediaMessage.mimetype.startsWith('audio')) {
            await conn.sendMessage(m.sender, {
                audio: buff,
                ptt: mediaMessage.ptt || false
            }, { quoted: fakeQuoted });
        } else {
            return reply("Unknown/Unsupported media");
        }

    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});

// "tovv" command: Converts a replied media message (non view-once) into a view once message.
cmd({
    pattern: "tovv",
    desc: "Convert media to a view once message.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { isReply, quoted, reply }) => {
    try {
        // Ensure the command is used in reply to a media message.
        if (!m.quoted) return reply("Please reply to a media message!");

        // Extract the media from the quoted message.
        const qmessage = m.message.extendedTextMessage.contextInfo.quotedMessage;
        const mediaMessage = qmessage.imageMessage ||
                             qmessage.videoMessage ||
                             qmessage.audioMessage;
        if (!mediaMessage) {
            return reply("No media found in replied message!");
        }

        try {
            // Retrieve the media buffer and caption.
            const buff = await m.quoted.getbuff;
            const cap = mediaMessage.caption || '';

            // Send the media back with the "viewOnce" flag set to true.
            if (mediaMessage.mimetype.startsWith('image')) {
                await conn.sendMessage(m.chat, {
                    image: buff,
                    caption: cap,
                    viewOnce: true
                });
            } else if (mediaMessage.mimetype.startsWith('video')) {
                await conn.sendMessage(m.chat, {
                    video: buff,
                    caption: cap,
                    viewOnce: true
                });
            } else if (mediaMessage.mimetype.startsWith('audio')) {
                await conn.sendMessage(m.chat, {
                    audio: buff,
                    ptt: mediaMessage.ptt || false,
                    viewOnce: true
                });
            } else {
                return reply("Unsupported media type.");
            }
        } catch (error) {
            console.error(error);
            reply(`${error}`);
        }
    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});
