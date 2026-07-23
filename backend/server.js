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

        // If image file does not exist on disk, attempt on-the-fly SINGLE-PAGE generation from corresponding PDF
        if (!targetPath) {
            const parts = decodedPath.split("/").filter(Boolean); // e.g. ["semester-5", "compiler-design", "module-i", "page-1.png"]
            if (parts.length >= 4) {
                const semester = parts[0];
                const folder = parts[1];
                const noteSlug = parts[2];
                const pdfName = noteSlug + ".pdf";
                const imageName = parts[3]; // e.g. "page-1.png" or "page-01.png"

                const pageMatch = imageName.match(/page-(\d+)\.png$/i);
                const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : null;

                const candidatePdfs = [
                    path.join(__dirname, "pdfs", semester, folder, pdfName),
                    path.join(__dirname, "..", "pdfs", semester, folder, pdfName),
                    path.join(process.cwd(), "pdfs", semester, folder, pdfName),
                    path.join(process.cwd(), "backend", "pdfs", semester, folder, pdfName),
                ];

                const pdfPath = candidatePdfs.find((p) => fs.existsSync(p));

                if (pdfPath && pageNum !== null) {
                    const imageDir = path.join(__dirname, "images", semester, folder, noteSlug);
                    fs.mkdirSync(imageDir, { recursive: true });
                    const targetFile = path.join(imageDir, imageName);
                    const tempPrefix = path.join(imageDir, `temp_single_${pageNum}_${Date.now()}`);
                    const pdfPassword = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";

                    try {
                        execSync(`pdftoppm -upw "${pdfPassword}" -f ${pageNum} -l ${pageNum} -png "${pdfPath}" "${tempPrefix}"`, { timeout: 8000 });

                        const genFiles = fs.readdirSync(imageDir).filter(f => f.startsWith(path.basename(tempPrefix)));
                        if (genFiles.length > 0) {
                            const genPath = path.join(imageDir, genFiles[0]);
                            const rawBuf = fs.readFileSync(genPath);
                            const encBuf = encryptImageBuffer(rawBuf);
                            fs.writeFileSync(targetFile, encBuf);
                            fs.unlinkSync(genPath); // clean temp single image file
                            targetPath = targetFile;
                        }
                    } catch (genErr) {
                        console.error(`Single page image generation error (page ${pageNum}):`, genErr.message);
                    }
                }
            }
        }

        if (targetPath && fs.existsSync(targetPath)) {
            const rawBytes = fs.readFileSync(targetPath);
            const decryptedBytes = decryptImageBuffer(rawBytes);
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