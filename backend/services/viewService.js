const { readJSON, writeJSON } = require("../utils/file");
const { getIsConnected } = require("../config/db");
const View = require("../models/View");

async function recordView(data) {
    const entry = {
        id: Date.now(),
        viewerId: data.viewerId,
        name: data.name || null,
        semester: data.semester || "semester-5",
        subject: data.subject,
        note: data.note,
        ip: data.ip,
        browser: data.browser,
        openedAt: new Date(),
    };

    if (getIsConnected()) {
        try {
            await View.create(entry);
        } catch (err) {
            console.error("Failed to save view to MongoDB:", err.message);
        }
    }

    // Always keep local file updated as secondary buffer
    try {
        const views = readJSON("views.json");
        views.push({
            ...entry,
            openedAt: entry.openedAt.toISOString(),
        });
        writeJSON("views.json", views);
    } catch (e) {}
}

module.exports = {
    recordView,
};