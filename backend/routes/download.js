const express = require("express");
const path = require("path");
const fs = require("fs");

const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { recordDownload } = require("../services/downloadService");

const router = express.Router();

router.get("/:semester/:folder/:file", async (req, res) => {
    try {
        const { semester, folder, file } = req.params;
        const { viewerId, name } = req.query;

        const { ensureViewerExists } = require("../services/viewerService");
        const viewer = ensureViewerExists(viewerId, name, req);

        recordDownload({
            viewerId: viewerId || null,
            name: viewer ? viewer.name : name || null,
            semester,
            subject: folder,
            note: file,
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            browser: req.headers["user-agent"],
        });

        const pdfPath = path.join(
            __dirname,
            "..",
            "pdfs",
            semester,
            folder,
            file
        );

        const { getDecryptedPdfBytes } = require("../utils/pdfDecryptor");
        const password = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";
        const decryptedBytes = getDecryptedPdfBytes(pdfPath, password);

        const pdfDoc = await PDFDocument.load(decryptedBytes, { ignoreEncryption: true });

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        const rawName = viewer ? viewer.name : (name || "Guest Student");
        const studentName = rawName.length > 25 ? rawName.substring(0, 22) + "..." : rawName;
        const studentId = viewerId || (viewer ? viewer.id : "ANON");
        const dateStr = new Date().toISOString().split("T")[0];

        const watermarkText = `Downloaded by: ${studentName} (ID: ${studentId}) | Date: ${dateStr} | SleepyStudies • https://sleepystudies.vercel.app`;

        pages.forEach((page) => {
            const { width } = page.getSize();
            const maxWidth = width - 60; // 30px left & right margins

            let fontSize = 10.5;
            let textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

            while (textWidth > maxWidth && fontSize > 6.5) {
                fontSize -= 0.5;
                textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            }

            page.drawText(watermarkText, {
                x: 30,
                y: 20,
                size: fontSize,
                font,
                color: rgb(0.35, 0.35, 0.35),
            });
        });

        const pdfBytes = await pdfDoc.save();

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${file}"`
        );

        res.send(Buffer.from(pdfBytes));

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Unable to generate PDF"
        });
    }
});

module.exports = router;