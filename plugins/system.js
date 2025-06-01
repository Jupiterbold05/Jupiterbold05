;// Ensure we import both child_process and the performance API from Node’s perf_hooks.
const { cmd } = require("../command");
const { exec } = require("child_process");
const { performance } = require("perf_hooks");

// Restart command: After spawning a new process with "npm start", exit the current process.
cmd({
  pattern: "restart",
  alias: "reboot",
  desc: "Restart System",
  type: "system",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  await reply("Restarting the bot...");
  // Spawn the process. Adjust error handling if necessary.
  exec("npm start", (error, stdout, stderr) => {
    if (error) {
      console.error("Error restarting:", error);
      return;
    }
    console.log("Restart output:", stdout);
  });
  // Exit current process so that the new instance can run independently.
  process.exit(0);
});

// Ping command: Uses performance.now() to measure latency and attempts to update the initial message.


cmd({
  pattern: "ping",
  alias: "speed",
  desc: "To check ping",
  type: "system",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  const start = performance.now();
  await reply("ᴄʜᴇᴄᴋɪɴɢ...");
  const end = performance.now();
  const latency = (end - start).toFixed(2);
  await conn.sendMessage(m.chat, { text: `*ʟᴀᴛᴇɴᴄʏ:* ${latency} ms` }, { quoted: mek });
});