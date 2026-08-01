const express = require("express");
const { askAI } = require("../services/aiService");
const { recordAISearch } = require("../services/aiSearchService");

const router = express.Router();

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
    try {
        const { semester, subject, note, prompt, mode, viewerId } = req.body;

        if (!subject || !note) {
            return res.status(400).json({ error: "Missing required parameters (subject, note)" });
        }

        const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

        // Non-blocking confidential AI search log
        recordAISearch({
            subject,
            note,
            mode,
            prompt,
            viewerId,
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
