const { readJSON, writeJSON } = require("../utils/file");
const { getIsConnected } = require("../config/db");
const Download = require("../models/Download");

async function recordDownload(data) {
    const entry = {
        id: Date.now(),
        viewerId: data.viewerId || null,
        name: data.name || null,
        semester: data.semester || "semester-5",
        subject: data.subject,
        note: data.note,
        ip: data.ip,
        browser: data.browser,
        downloadedAt: new Date(),
    };

    if (getIsConnected()) {
        try {
            await Download.create(entry);
        } catch (err) {
            console.error("Failed to save download to MongoDB:", err.message);
        }
    }

    // Always keep local file updated as secondary buffer
    try {
        const downloads = readJSON("downloads.json");
        downloads.push({
            ...entry,
            downloadedAt: entry.downloadedAt.toISOString(),
        });
        writeJSON("downloads.json", downloads);
    } catch (e) {}
}

module.exports = {
    recordDownload,
};
