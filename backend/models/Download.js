const mongoose = require("mongoose");

const DownloadSchema = new mongoose.Schema({
    id: { type: Number, index: true },
    viewerId: { type: String, default: null, index: true },
    name: { type: String, default: null },
    semester: { type: String, index: true },
    subject: { type: String, index: true },
    note: { type: String, index: true },
    ip: String,
    browser: String,
    downloadedAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.models.Download || mongoose.model("Download", DownloadSchema);
