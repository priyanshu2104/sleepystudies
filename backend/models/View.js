const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema({
    id: { type: Number, index: true },
    viewerId: { type: String, index: true },
    name: { type: String, default: null },
    semester: { type: String, index: true },
    subject: { type: String, index: true },
    note: { type: String, index: true },
    ip: String,
    browser: String,
    openedAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.models.View || mongoose.model("View", ViewSchema);
