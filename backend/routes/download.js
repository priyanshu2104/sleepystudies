const express = require("express");
const path = require("path");
const fs = require("fs");

const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const { recordDownload } = require("../services/downloadService");
const { getDecryptedPdfBytes } = require("../utils/pdfDecryptor");

const router = express.Router();

router.get("/:semester/:folder/:file", async (req, res) => {
    try {
        const { semester, folder, file } = req.params;
        const { viewerId, name } = req.query;

        const pdfPath = path.join(
            __dirname,
            "..",
            "pdfs",
            semester,
            folder,
            file
        );

        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ error: "File not found" });
        }

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

        const password = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";
        const decryptedBytes = await getDecryptedPdfBytes(pdfPath, password);

        const pdfDoc = await PDFDocument.load(decryptedBytes, { ignoreEncryption: true });

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        const rawName = viewer ? viewer.name : (name || "Guest Student");
        const studentName = rawName.length > 25 ? rawName.substring(0, 22) + "..." : rawName;
        const studentId = viewerId || (viewer ? viewer.id : "ANON");
        const dateStr = new Date().toISOString().split("T")[0];

        const watermarkText = `Downloaded by: ${studentName} (ID: ${studentId}) | Date: ${dateStr} | SleepyStudies • https://sleepystudies.vercel.app`;

        pages.forEach((page) => {
            const { width: pageW, height: pageH } = page.getSize();
            const rot = (page.getRotation().angle || 0) % 360;

            const isRotated90or270 = rot === 90 || rot === 270;
            const visWidth = isRotated90or270 ? pageH : pageW;
            const visHeight = isRotated90or270 ? pageW : pageH;

            const maxTextWidth = visWidth - 40;
            let fontSize = 10.5;
            let textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            while (textWidth > maxTextWidth && fontSize > 5.5) {
                fontSize -= 0.5;
                textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            }

            const startX = Math.max(15, (visWidth - textWidth) / 2);
            const startY = 20;

            try {
                if (rot === 0) {
                    page.drawRectangle({
                        x: startX - 6,
                        y: startY - 4,
                        width: textWidth + 12,
                        height: fontSize + 8,
                        color: rgb(0.96, 0.96, 0.96),
                        opacity: 0.85,
                    });
                    page.drawText(watermarkText, {
                        x: startX,
                        y: startY,
                        size: fontSize,
                        font,
                        color: rgb(0.2, 0.2, 0.2),
                    });
                } else if (rot === 90) {
                    page.drawRectangle({
                        x: pageW - startY - (fontSize + 4),
                        y: startX - 6,
                        width: fontSize + 8,
                        height: textWidth + 12,
                        color: rgb(0.96, 0.96, 0.96),
                        opacity: 0.85,
                    });
                    page.drawText(watermarkText, {
                        x: pageW - startY,
                        y: startX,
                        size: fontSize,
                        font,
                        color: rgb(0.2, 0.2, 0.2),
                        rotate: degrees(90),
                    });
                } else if (rot === 180) {
                    page.drawRectangle({
                        x: pageW - startX - textWidth - 6,
                        y: pageH - startY - (fontSize + 4),
                        width: textWidth + 12,
                        height: fontSize + 8,
                        color: rgb(0.96, 0.96, 0.96),
                        opacity: 0.85,
                    });
                    page.drawText(watermarkText, {
                        x: pageW - startX,
                        y: pageH - startY,
                        size: fontSize,
                        font,
                        color: rgb(0.2, 0.2, 0.2),
                        rotate: degrees(180),
                    });
                } else if (rot === 270) {
                    page.drawRectangle({
                        x: startY - 4,
                        y: pageH - startX - textWidth - 6,
                        width: fontSize + 8,
                        height: textWidth + 12,
                        color: rgb(0.96, 0.96, 0.96),
                        opacity: 0.85,
                    });
                    page.drawText(watermarkText, {
                        x: startY,
                        y: pageH - startX,
                        size: fontSize,
                        font,
                        color: rgb(0.2, 0.2, 0.2),
                        rotate: degrees(270),
                    });
                }
            } catch (wErr) {
                console.error("Failed to watermark page:", wErr);
            }
        });

        const pdfBytes = await pdfDoc.save();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${file}"`);

        res.send(Buffer.from(pdfBytes));

    } catch (err) {
        console.error("PDF Download Generation Error:", err);
        res.status(500).json({
            error: "Unable to generate PDF"
        });
    }
});

module.exports = router;