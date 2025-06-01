const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

// Base API URLs
const fantoxApiUrl = "https://fantox-apis.vercel.app";
const giftedApiUrl = "https://giftedapis.us.kg/api";

// Helper function to clear a reaction after 5 seconds
async function clearReaction(m) {
  try {
    // Calling m.react("") is an example; adjust it according to your bot’s API for removing reactions
    await m.react("");
  } catch (e) {
    console.error("Error clearing reaction:", e);
  }
}

/* ------------------------------------------------------------------
   1. NSFW Image Commands (dynamic endpoints)
   ------------------------------------------------------------------ */
const endpoints = [
  "genshin", "swimsuit", "schoolswimsuit", "white", "barefoot", "touhou",
  "gamecg", "hololive", "uncensored", "sunglasses", "glasses", "weapon",
  "shirtlift", "chain", "fingering", "flatchest", "torncloth", "bondage",
  "demon", "wet", "pantypull", "headdress", "headphone", "tie", "anusview",
  "shorts", "stokings", "topless", "beach", "bunnygirl", "bunnyear", "idol",
  "vampire", "gun", "maid", "bra", "nobra", "bikini", "whitehair", "blonde",
  "pinkhair", "bed", "ponytail", "nude", "dress", "underwear", "foxgirl",
  "uniform", "skirt", "sex", "sex2", "sex3", "breast", "twintail",
  "spreadpussy", "tears", "seethrough", "breasthold", "drunk", "fateseries",
  "spreadlegs", "openshirt", "headband", "food", "close", "tree", "nipples",
  "erectnipples", "horns", "greenhair", "wolfgirl", "catgirl"
];

endpoints.forEach((endpoint) => {
  cmd(
    {
      pattern: endpoint,
      desc: `Send pictures of random ${endpoint}s!`,
      category: "nsfw",
      react: "🍑",
      filename: __filename,
    },
    async (
      conn,
      mek,
      m,
      { from, quoted, body, isCmd, command, args, q, isGroup, sender, botNumber, pushname, isMe, isOwner, reply }
    ) => {
      try {
        const res = await fetch(`${fantoxApiUrl}/${endpoint}`);
        const json = await res.json();

        if (!json.url)
          return reply(`*Request Denied for ${endpoint}!*`);

        const caption = `Here's a pic of ${endpoint}`;
        await conn.sendMessage(
          m.chat,
          { image: { url: json.url }, caption },
          { quoted: m }
        );

        // Clear reaction after 5 seconds.
        setTimeout(() => {
          clearReaction(m);
        }, 5000);
      } catch (e) {
        reply(`Error in ${endpoint} command:\n\n${e}`);
      }
    }
  );
});

/* ------------------------------------------------------------------
   2. xsearch Command for NSFW content search
   ------------------------------------------------------------------ */
cmd(
  {
    pattern: "xsearch",
    desc: "Search for NSFW content based on a query.",
    category: "nsfw",
    react: "🔍",
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, botNumber, pushname, isMe, isOwner, reply }
  ) => {
    try {
      const query = args.slice(1).join(" ");
      if (!query)
        return reply("Please provide a search term, e.g., `.xsearch mon and son`.");

      await reply("Platinum-v1 is fetching the results...");

      const searchUrl = `${giftedApiUrl}/search/xnxxsearch?query=${encodeURIComponent(query)}&apikey=_0x5aff35,_0x187643`;
      const response = await fetch(searchUrl);
      if (!response.ok)
        return reply(`*_Error: ${response.status} ${response.statusText}_*`);

      const data = await response.json();
      if (
        !data.gifted.success ||
        !data.gifted.results ||
        data.gifted.results.length === 0
      ) {
        return reply(`No results found for "${query}".`);
      }

      let message = `*Results for "${query}":*\n\n`;
      data.gifted.results.forEach((result, index) => {
        message += `${index + 1}. ${result.title}\nLink: ${result.link}\n\n`;
      });

      await reply(message);
      setTimeout(() => {
        clearReaction(m);
      }, 5000);
    } catch (e) {
      reply(`Error in xsearch command:\n\n${e}`);
    }
  }
);

/* ------------------------------------------------------------------
   3. xdl Command for NSFW Video Download
   ------------------------------------------------------------------ */
cmd(
  {
    pattern: "xdl",
    alias: ["xx"],
    desc: "Download video from a given link.",
    category: "nsfw",
    react: "⏳",
    filename: __filename,
    use: "<Video URL>",
  },
  async (
    conn,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, botNumber, pushname, isMe, isOwner, reply }
  ) => {
    try {
      if (args.length < 2)
        return reply("*Please provide a video URL*");
      const videoUrl = args[1];

      const apiUrl = `${giftedApiUrl}/download/xnxxdl?url=${encodeURIComponent(videoUrl)}&apikey=_0x5aff35,_0x187643`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      console.log("API Response:", data);

      if (
        data.success &&
        data.result &&
        data.result.files &&
        data.result.files.low
      ) {
        const videoDownloadUrl = data.result.files.low;
        const videoResponse = await axios({
          url: videoDownloadUrl,
          method: "GET",
          responseType: "stream",
        });

        const tempFilePath = path.join(__dirname, `${Date.now()}.mp4`);
        const writer = fs.createWriteStream(tempFilePath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        console.log(`Video saved to ${tempFilePath}`);

        await conn.sendMessage(
          m.chat,
          {
            video: { url: tempFilePath },
            caption: "Here is your downloaded video",
            fileName: `${Date.now()}.mp4`,
            mimetype: "video/mp4",
          },
          { quoted: m }
        );

        // Delete the temporary file.
        fs.unlinkSync(tempFilePath);

        setTimeout(() => {
          clearReaction(m);
        }, 5000);
      } else {
        console.log("Error: Could not retrieve video download URL. API response:", data);
        return reply("*Error: Could not retrieve the video download URL. Please try again later!*");
      }
    } catch (err) {
      console.error("Caught Error in xdl command:", err);
      return reply(`Error in xdl command:\n\n${err}`);
    }
  }
);