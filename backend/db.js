import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, ".env");

dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME || "ai_resume_platform";
let client;
let db;

export async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${uri}`);
  }
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

export function getCollection(name) {
  return getDB().collection(name);
}

export async function findOne(collectionName, query) {
  return getCollection(collectionName).findOne(query);
}

export async function findMany(collectionName, query = {}) {
  return getCollection(collectionName).find(query).toArray();
}

export async function insertOne(collectionName, document) {
  return getCollection(collectionName).insertOne(document);
}

export async function updateOne(collectionName, filter, update, options = {}) {
  return getCollection(collectionName).updateOne(filter, update, options);
}

export async function replaceAll(collectionName, documents) {
  const collection = getCollection(collectionName);
  await collection.deleteMany({});
  if (documents.length > 0) {
    await collection.insertMany(documents);
  }
}
