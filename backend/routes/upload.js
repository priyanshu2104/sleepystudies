const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

const router = express.Router();

// Temporary directory for multer storage before moving to subject folder
const tempDir = path.join(__dirname, "..", "temp_uploads");
fs.ensureDirSync(tempDir);

const upload = multer({ dest: tempDir });

router.post("/", upload.single("file"), async (req, res) => {
    // Validate passcode
    const passcode = req.headers["x-admin-passcode"];
    const requiredPasscode = process.env.ADMIN_PASSCODE || "admin123";

    if (passcode !== requiredPasscode) {
        if (req.file) {
            await fs.remove(req.file.path).catch(() => {});
        }
        return res.status(401).json({
            error: "Unauthorized: Invalid admin passcode.",
        });
    }

    try {
        const { semester, subject, title } = req.body;

        if (!semester || !subject || !title || !req.file) {
            if (req.file) {
                await fs.remove(req.file.path).catch(() => {});
            }
            return res.status(400).json({
                error: "Semester, subject, title, and PDF file are required.",
            });
        }

        // Validate that it is a PDF file
        if (!req.file.originalname.toLowerCase().endsWith(".pdf")) {
            await fs.remove(req.file.path).catch(() => {});
            return res.status(400).json({
                error: "Only PDF files are allowed.",
            });
        }

        // Create standard semester slug (e.g. "Semester 1" -> "semester-1")
        const semesterSlug = semester
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        if (!semesterSlug) {
            await fs.remove(req.file.path).catch(() => {});
            return res.status(400).json({
                error: "Invalid semester name.",
            });
        }

        // Create standard subject slug (e.g. "Data Structures" -> "data-structures")
        const subjectSlug = subject
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        if (!subjectSlug) {
            await fs.remove(req.file.path).catch(() => {});
            return res.status(400).json({
                error: "Invalid subject name.",
            });
        }

        // Create file name from title (e.g. "Arrays Unit 1" -> "arrays-unit-1.pdf")
        let filename = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        if (!filename) {
            await fs.remove(req.file.path).catch(() => {});
            return res.status(400).json({
                error: "Invalid note title.",
            });
        }

        filename += ".pdf";

        const subjectDir = path.join(__dirname, "..", "pdfs", semesterSlug, subjectSlug);
        await fs.ensureDir(subjectDir);

        const destPath = path.join(subjectDir, filename);

        // Move file from temporary directory to actual subject directory
        await fs.move(req.file.path, destPath, { overwrite: true });

        // Auto-generate thumbnails in the background
        const imageDir = path.join(
            __dirname,
            "..",
            "images",
            semesterSlug,
            subjectSlug,
            filename.replace(".pdf", "")
        );
        await fs.ensureDir(imageDir);
        const outputPrefix = path.join(imageDir, "page");

        exec(`pdftoppm "${destPath}" "${outputPrefix}" -png`, (err) => {
            if (err) {
                console.error("Background thumbnail generation failed:", err);
            } else {
                console.log(`Auto-generated thumbnails for ${filename} successfully.`);
            }
        });

        res.json({
            success: true,
            note: {
                title: title.trim(),
                file: filename,
                subject: subjectSlug,
                semester: semesterSlug,
            },
        });
    } catch (err) {
        console.error("Upload error:", err);
        if (req.file) {
            await fs.remove(req.file.path).catch(() => {});
        }
        res.status(500).json({
            error: "Failed to upload note.",
        });
    }
});

module.exports = router;
