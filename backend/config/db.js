const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || mongoUri.trim() === "") {
        console.log("ℹ️ MONGODB_URI not provided. Running with local JSON fallback.");
        return false;
    }

    if (isConnected) return true;

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log("⚡ MongoDB Connected Successfully!");
        return true;
    } catch (err) {
        console.error("⚠️ MongoDB Connection Error:", err.message);
        console.log("ℹ️ Falling back to local JSON files.");
        return false;
    }
}

function getIsConnected() {
    return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
    connectDB,
    getIsConnected,
};
