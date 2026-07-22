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

        // If image file does not exist on disk, attempt on-the-fly generation from corresponding PDF
        if (!targetPath) {
            const parts = decodedPath.split("/").filter(Boolean); // e.g. ["semester-5", "compiler-design", "module-i", "page-01.png"]
            if (parts.length >= 4) {
                const semester = parts[0];
                const folder = parts[1];
                const pdfName = parts[2] + ".pdf";

                const candidatePdfs = [
                    path.join(__dirname, "pdfs", semester, folder, pdfName),
                    path.join(__dirname, "..", "pdfs", semester, folder, pdfName),
                    path.join(process.cwd(), "pdfs", semester, folder, pdfName),
                    path.join(process.cwd(), "backend", "pdfs", semester, folder, pdfName),
                ];

                const pdfPath = candidatePdfs.find((p) => fs.existsSync(p));

                if (pdfPath) {
                    const imageDir = path.join(path.dirname(pdfPath), "..", "..", "images", semester, folder, parts[2]);
                    fs.mkdirSync(imageDir, { recursive: true });
                    const outputPrefix = path.join(imageDir, "page");
                    const pdfPassword = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";

                    try {
                        execSync(`pdftoppm -upw "${pdfPassword}" "${pdfPath}" "${outputPrefix}" -png`, { timeout: 15000 });

                        const generatedFiles = fs.readdirSync(imageDir);
                        for (const f of generatedFiles) {
                            if (f.endsWith(".png")) {
                                const p = path.join(imageDir, f);
                                const raw = fs.readFileSync(p);
                                fs.writeFileSync(p, encryptImageBuffer(raw));
                            }
                        }

                        targetPath = candidatePaths.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
                    } catch (genErr) {
                        console.error("Auto image generation error:", genErr.message);
                    }
                }
            }
        }

        if (targetPath) {
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