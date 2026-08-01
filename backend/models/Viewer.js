const mongoose = require("mongoose");

const ViewerSchema = new mongoose.Schema({
    viewerId: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    ip: String,
    browser: String,
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Viewer || mongoose.model("Viewer", ViewerSchema);
