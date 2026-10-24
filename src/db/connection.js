const mongoose = require('mongoose');

let isConnected = false;

async function connectMongoDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('[MongoDB] MONGODB_URI not configured. Running with local persistent sheet storage.');
    return null;
  }

  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoUri.replace(/\/\/[^@]+@/, '//***:***@')}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB (${err.message}). Falling back to local storage.`);
    return null;
  }
}

function getMongoStatus() {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
}

module.exports = {
  connectMongoDB,
  getMongoStatus,
  mongoose
};
