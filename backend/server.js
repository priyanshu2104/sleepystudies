require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const notesRoute = require("./routes/notes");
const viewRoute = require("./routes/view");
const downloadRoute = require("./routes/download");
const viewerRoute = require("./routes/viewer");
const searchRoute = require("./routes/search");
const uploadRoute = require("./routes/upload");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/viewer", viewerRoute);
app.use("/search", searchRoute);

const { decryptImageBuffer, encryptImageBuffer } = require("./utils/imageCrypto");
const { execSync } = require("child_process");
const fs = require("fs");

function renderSinglePageSync(pdfPath, imageDir, pageNum, pdfPassword) {
    const targetFile = path.join(imageDir, `page-${pageNum}.png`);
    if (fs.existsSync(targetFile)) return targetFile;

    fs.mkdirSync(imageDir, { recursive: true });
    const tempPrefix = path.join(imageDir, `temp_single_${pageNum}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);

    try {
        execSync(`pdftoppm -upw "${pdfPassword}" -scale-to-x 1000 -scale-to-y -1 -f ${pageNum} -l ${pageNum} -png "${pdfPath}" "${tempPrefix}"`, { timeout: 8000 });
        const genFiles = fs.readdirSync(imageDir).filter(f => f.startsWith(path.basename(tempPrefix)));
        if (genFiles.length > 0) {
            const genPath = path.join(imageDir, genFiles[0]);
            const rawBuf = fs.readFileSync(genPath);
            const encBuf = encryptImageBuffer(rawBuf);
            fs.writeFileSync(targetFile, encBuf);
            try { fs.unlinkSync(genPath); } catch (e) {}
            return targetFile;
        }
    } catch (genErr) {
        // Silently handle out-of-range pages
    }
    return null;
}

// Serve generated images (Auto-decrypted & Auto-generated on demand for website viewers)
app.use("/images", (req, res, next) => {
    try {
        const decodedPath = decodeURIComponent(req.path);
        const candidatePaths = [
            path.join(__dirname, "images", decodedPath),
            path.join(__dirname, "..", "images", decodedPath),
            path.join(process.cwd(), "images", decodedPath),
            path.join(process.cwd(), "backend", "images", decodedPath),
        ];

        let targetPath = candidatePaths.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
        const pdfPassword = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";

        const parts = decodedPath.split("/").filter(Boolean); // e.g. ["semester-5", "compiler-design", "module-i", "page-1.png"]
        let pdfPath = null;
        let imageDir = null;
        let pageNum = null;

        if (parts.length >= 4) {
            const semester = parts[0];
            const folder = parts[1];
            const noteSlug = parts[2];
            const pdfName = noteSlug + ".pdf";
            const imageName = parts[3];

            const pageMatch = imageName.match(/page-(\d+)\.png$/i);
            pageNum = pageMatch ? parseInt(pageMatch[1], 10) : null;

            const candidatePdfs = [
                path.join(__dirname, "pdfs", semester, folder, pdfName),
                path.join(__dirname, "..", "pdfs", semester, folder, pdfName),
                path.join(process.cwd(), "pdfs", semester, folder, pdfName),
                path.join(process.cwd(), "backend", "pdfs", semester, folder, pdfName),
            ];

            pdfPath = candidatePdfs.find((p) => fs.existsSync(p));
            if (pdfPath && pageNum !== null) {
                imageDir = path.join(__dirname, "images", semester, folder, noteSlug);
            }
        }

        // If image file does not exist on disk, render single page on demand
        if (!targetPath && pdfPath && imageDir && pageNum !== null) {
            targetPath = renderSinglePageSync(pdfPath, imageDir, pageNum, pdfPassword);
        }

        if (targetPath && fs.existsSync(targetPath)) {
            const rawBytes = fs.readFileSync(targetPath);
            const decryptedBytes = decryptImageBuffer(rawBytes);

            // Trigger background pre-render of next 2 pages asynchronously
            if (pdfPath && imageDir && pageNum !== null) {
                setImmediate(() => {
                    renderSinglePageSync(pdfPath, imageDir, pageNum + 1, pdfPassword);
                    renderSinglePageSync(pdfPath, imageDir, pageNum + 2, pdfPassword);
                });
            }

            res.setHeader("Content-Type", "image/png");
            return res.end(decryptedBytes);
        }
    } catch (e) {
        console.error("Failed to serve image:", e.message);
    }
    res.status(404).send("Image not found");
});

// Serve original PDFs (optional, useful for testing)
app.use(
    "/pdfs",
    express.static(path.join(__dirname, "pdfs"))
);

// API Routes
app.use("/notes", notesRoute);
app.use("/view", viewRoute);
app.use("/download", downloadRoute);
app.use("/upload", uploadRoute);
app.use("/api/sync", require("./routes/sync"));

app.get("/", (req, res) => {
    res.send("SleepyStudies Backend Running");
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});