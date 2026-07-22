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

        const existingPdf = fs.readFileSync(pdfPath);

        const pdfDoc = await PDFDocument.load(existingPdf, { ignoreEncryption: true });

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
            page.drawText(
                "Downloaded from SleepyStudies | sleepystudies.vercel.app",
                {
                    x: 50,
                    y: 20,
                    size: 10,
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