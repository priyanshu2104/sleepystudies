const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

const { recordView } = require("../services/viewService");

const router = express.Router();

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

        const imageDir = path.join(
            __dirname,
            "..",
            "images",
            semester,
            folder,
            file.replace(".pdf", "")
        );

        await fs.ensureDir(imageDir);

        let files = (await fs.readdir(imageDir))
            .filter((f) => f.endsWith(".png"))
            .sort();

        // Generate images only if they don't exist
        if (files.length === 0) {
            const outputPrefix = path.join(imageDir, "page");

            const pdfPassword = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";
            const passFlag = pdfPassword ? `-upw "${pdfPassword}"` : "";

            await new Promise((resolve, reject) => {
                exec(
                    `pdftoppm ${passFlag} "${pdfPath}" "${outputPrefix}" -png`,
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            files = (await fs.readdir(imageDir))
                .filter((f) => f.endsWith(".png"))
                .sort();
        }

        const protocol = req.headers["x-forwarded-proto"] || "http";
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        const pages = files.map(
            (f) =>
                `${baseUrl}/images/${semester}/${folder}/${file.replace(
                    ".pdf",
                    ""
                )}/${f}`
        );

        res.json({
            thumbnail: pages[0],
            pages,
        });
    } catch (err) {
        console.error(err);

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