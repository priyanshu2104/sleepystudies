const express = require("express");
const { readJSON } = require("../utils/file");

const router = express.Router();

router.get("/logs", (req, res) => {
    try {
        // Validate passcode
        const passcode = req.headers["x-admin-passcode"];
        const requiredPasscode = process.env.ADMIN_PASSCODE || "admin123";

        if (passcode !== requiredPasscode) {
            return res.status(401).json({
                error: "Unauthorized: Invalid admin passcode.",
            });
        }

        const viewers = readJSON("viewers.json");
        const views = readJSON("views.json");
        const downloads = readJSON("downloads.json");

        res.json({
            viewers: viewers.reverse(), // Show newest first
            views: views.reverse(),
            downloads: downloads.reverse()
        });
    } catch (err) {
        console.error("Failed to load logs:", err);
        res.status(500).json({ error: "Failed to load logs" });
    }
});

module.exports = router;
