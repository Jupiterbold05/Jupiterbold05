// lib/db.js
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let botCollection = null;

async function connectToMongo() {
  try {
    await client.connect();
    const db = client.db("botDB");
    // This collection stores only the global config for antidelete.
    botCollection = db.collection("bot");
    console.log("Connected to MongoDB (config collection)");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongo();

module.exports = {
  getBotCollection() {
    if (!botCollection) throw new Error("MongoDB not connected yet");
    return botCollection;
  }
};
