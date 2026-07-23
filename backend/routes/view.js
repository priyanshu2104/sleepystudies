const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

const { recordView } = require("../services/viewService");

const router = express.Router();

const { getPdfPageCount } = require("../utils/pdfHelper");

router.get("/:semester/:folder/:file", async (req, res) => {
    try {
        const { semester, folder, file } = req.params;

        const pdfPath = path.join(
            __dirname,
            "..",
            "pdfs",
            semester,
            folder,
            file
        );

        if (!(await fs.pathExists(pdfPath))) {
            return res.status(404).json({
                error: "PDF not found",
            });
        }

        const noteSlug = file.replace(".pdf", "");
        const imageDir = path.join(
            __dirname,
            "..",
            "images",
            semester,
            folder,
            noteSlug
        );

        await fs.ensureDir(imageDir);

        const password = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";
        const pageCount = getPdfPageCount(pdfPath, password);

        const protocol = req.headers["x-forwarded-proto"] || "http";
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        const pages = Array.from({ length: pageCount }, (_, i) =>
            `${baseUrl}/images/${semester}/${folder}/${noteSlug}/page-${i + 1}.png`
        );

        res.json({
            thumbnail: pages[0],
            pages,
        });
    } catch (err) {
        console.error("View route error:", err);

        res.status(500).json({
            error: "Unable to load PDF",
        });
    }
});

router.post("/record", (req, res) => {
    try {
        const { viewerId, name, subject, note } = req.body;
        const { ensureViewerExists } = require("../services/viewerService");
        const viewer = ensureViewerExists(viewerId, name, req);

        recordView({
            viewerId: viewerId || null,
            name: viewer ? viewer.name : name || null,
            subject,
            note,
            ip:
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress,
            browser: req.headers["user-agent"],
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Failed to record view:", err);
        res.status(500).json({ error: "Failed to record view" });
    }
});

module.exports = router;