const path = require("path");
const crypto = require("crypto");
const { getIsConnected } = require("../config/db");
const AISearch = require("../models/AISearch");
const { readJSON, writeJSON } = require("../utils/file");

function hashIp(ip) {
    if (!ip) return "";
    return crypto.createHash("sha256").update(ip + "SleepySalt2026").digest("hex").slice(0, 16);
}

async function recordAISearch({ subject, note, mode, prompt, viewerId, viewerName, ip }) {
    setImmediate(async () => {
        try {
            const searchData = {
                subject: subject || "unknown",
                note: note || "unknown",
                mode: mode || "custom",
                prompt: prompt || "",
                viewerId: viewerId || "anonymous",
                viewerName: viewerName || "Anonymous Student",
                timestamp: new Date().toISOString(),
                ip: ip || "",
                ipHash: hashIp(ip),
            };

            if (getIsConnected()) {
                await AISearch.create(searchData);
            } else {
                const logs = readJSON("aisearches.json");
                logs.push(searchData);
                writeJSON("aisearches.json", logs);
            }
        } catch (err) {
            console.error("Failed to record AI search log:", err.message);
        }
    });
}

module.exports = {
    recordAISearch,
};
