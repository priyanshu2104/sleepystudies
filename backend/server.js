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

const { decryptImageBuffer } = require("./utils/imageCrypto");

// Serve generated images (Auto-decrypted for website viewers)
app.use("/images", (req, res, next) => {
    try {
        const decodedPath = decodeURIComponent(req.path);
        const candidatePaths = [
            path.join(__dirname, "images", decodedPath),
            path.join(__dirname, "..", "images", decodedPath),
            path.join(process.cwd(), "images", decodedPath),
            path.join(process.cwd(), "backend", "images", decodedPath),
        ];

        let targetPath = null;
        for (const candidate of candidatePaths) {
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                targetPath = candidate;
                break;
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
    next();
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