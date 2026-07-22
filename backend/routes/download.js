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

        const { degrees } = require("pdf-lib");
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        const studentName = (viewer && viewer.name) ? viewer.name : (name || "Student");
        const studentId = viewerId ? ` (ID: ${viewerId})` : "";
        const watermarkText = `SleepyStudies • ${studentName}${studentId}`;

        // Option 4: Tiled Grid Pattern Watermark across every page
        pages.forEach((page) => {
            const { width, height } = page.getSize();
            
            const xRatios = [0.15, 0.50, 0.85];
            const yRatios = [0.20, 0.50, 0.80];

            xRatios.forEach((xRatio) => {
                yRatios.forEach((yRatio) => {
                    page.drawText(watermarkText, {
                        x: width * xRatio - 75,
                        y: height * yRatio,
                        size: 9,
                        font,
                        color: rgb(0.82, 0.82, 0.85),
                        rotate: degrees(-20),
                    });
                });
            });

            // Footer identity stamp
            page.drawText(
                `Licensed To: ${studentName}${studentId} • SleepyStudies • sleepystudies.vercel.app`,
                {
                    x: 30,
                    y: 15,
                    size: 8,
                    font,
                    color: rgb(0.5, 0.5, 0.5),
                }
            );
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