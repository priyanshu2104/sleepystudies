const express = require("express");
const { askAI } = require("../services/aiService");
const { recordAISearch } = require("../services/aiSearchService");

const router = express.Router();

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
    try {
        const { semester, subject, note, prompt, mode, viewerId, viewerName } = req.body;

        if (!subject || !note) {
            return res.status(400).json({ error: "Missing required parameters (subject, note)" });
        }

        const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        const clientIp = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "";

        // Record AI search log with student details & IP
        recordAISearch({
            subject,
            note,
            mode,
            prompt,
            viewerId,
            viewerName,
            ip: clientIp,
        });

        const answer = await askAI({ semester, subject, note, prompt, mode });

        res.json({
            success: true,
            answer,
        });
    } catch (err) {
        console.error("AI Route Error:", err);
        res.status(500).json({
            error: err.message || "Failed to process AI request",
        });
    }
});

module.exports = router;
