import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.MONGODBURI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (uri && !uri.includes('<db_username>')) {
  // In Next.js (both dev and serverless production), cache client across invocations
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = null;
}

export default clientPromise;
