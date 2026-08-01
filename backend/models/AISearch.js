const mongoose = require("mongoose");

const aiSearchSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    note: { type: String, required: true },
    mode: { type: String, default: "custom" },
    prompt: { type: String, default: "" },
    viewerId: { type: String, default: "anonymous" },
    timestamp: { type: Date, default: Date.now },
    ipHash: { type: String, default: "" },
});

module.exports = mongoose.models.AISearch || mongoose.model("AISearch", aiSearchSchema);
