const express = require("express");
const path = require("path");
const fs = require("fs-extra");

const router = express.Router();

// Middleware to authenticate admin requests
function checkAdminKey(req, res, next) {
    const adminKey = process.env.ADMIN_LOGS_KEY;
    if (!adminKey || adminKey.trim() === "") {
        return res.status(500).json({
            error: "Admin key is not configured on the production server.",
        });
    }

    const clientKey = req.headers["x-admin-token"] || req.query.key;
    if (!clientKey || clientKey !== adminKey) {
        return res.status(403).json({
            error: "Forbidden: Invalid or missing admin key.",
        });
    }

    next();
}

// Recursively list files in a folder and return paths, sizes, and mtime
async function getFilesRecursively(dir, rootDir, fileList = []) {
    if (!(await fs.pathExists(dir))) return fileList;

    const files = await fs.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            await getFilesRecursively(fullPath, rootDir, fileList);
        } else {
            fileList.push({
                path: path.relative(rootDir, fullPath),
                size: stat.size,
                mtime: stat.mtimeMs,
            });
        }
    }
    return fileList;
}

// GET /api/sync/manifest
// Returns a list of files in data/, pdfs/, and images/
router.get("/manifest", checkAdminKey, async (req, res) => {
    try {
        const backendRoot = path.resolve(__dirname, "..");
        const foldersToSync = ["data", "pdfs"];
        
        let allFiles = [];
        for (const folder of foldersToSync) {
            const folderPath = path.join(backendRoot, folder);
            await getFilesRecursively(folderPath, backendRoot, allFiles);
        }

        // Ensure key data files are always present in manifest
        const dataFiles = [
            "data/views.json",
            "data/downloads.json",
            "data/viewers.json",
            "data/aisearches.json"
        ];

        dataFiles.forEach(df => {
            if (!allFiles.some(f => f.path === df)) {
                allFiles.push({ path: df, size: 100, mtime: Date.now() });
            }
        });

        res.json(allFiles);
    } catch (err) {
        console.error("Failed to build sync manifest:", err);
        res.status(500).json({ error: "Failed to build sync manifest" });
    }
});

// GET /api/sync/file?path=relative/path
// Securely serves a file inside data/, pdfs/, or images/
router.get("/file", checkAdminKey, async (req, res) => {
    try {
        const requestedPath = req.query.path;
        if (!requestedPath) {
            return res.status(400).json({ error: "Missing 'path' query parameter" });
        }

        const { getIsConnected } = require("../config/db");
        const View = require("../models/View");
        const Download = require("../models/Download");
        const Viewer = require("../models/Viewer");
        const AISearch = require("../models/AISearch");

        // If data/*.json is requested and MongoDB Atlas is connected, export live DB records
        if (requestedPath.startsWith("data/") && getIsConnected()) {
            if (requestedPath.endsWith("views.json")) {
                const docs = await View.find({}).lean();
                return res.json(docs);
            }
            if (requestedPath.endsWith("downloads.json")) {
                const docs = await Download.find({}).lean();
                return res.json(docs);
            }
            if (requestedPath.endsWith("viewers.json")) {
                const docs = await Viewer.find({}).lean();
                return res.json(docs);
            }
            if (requestedPath.endsWith("aisearches.json")) {
                const docs = await AISearch.find({}).lean();
                return res.json(docs);
            }
        }

        const backendRoot = path.resolve(__dirname, "..");
        const absolutePath = path.resolve(backendRoot, requestedPath);

        // Security check: Must not escape backend root directory
        if (!absolutePath.startsWith(backendRoot)) {
            return res.status(403).json({ error: "Access Denied: Path escapes server directory." });
        }

        // Security check: Must reside inside one of the safe directories
        const relative = path.relative(backendRoot, absolutePath);
        const firstSegment = relative.split(path.sep)[0];
        const safeDirs = ["data", "pdfs", "images"];

        if (!safeDirs.includes(firstSegment)) {
            return res.status(403).json({ error: "Access Denied: Forbidden folder destination." });
        }

        // Check if file exists and is not a directory
        if (!(await fs.pathExists(absolutePath))) {
            return res.json([]);
        }

        const stat = await fs.stat(absolutePath);
        if (stat.isDirectory()) {
            return res.status(400).json({ error: "Requested path is a directory, not a file." });
        }

        // Stream file response
        res.sendFile(absolutePath);
    } catch (err) {
        console.error("Failed to download file:", err);
        res.status(500).json({ error: "Server error occurred during file download." });
    }
});

// POST /api/sync/upload
// Securely uploads/overwrites a file inside the data/ folder (e.g. logs)
router.post("/upload", checkAdminKey, async (req, res) => {
    try {
        const { path: requestedPath, content } = req.body;
        if (!requestedPath || content === undefined) {
            return res.status(400).json({ error: "Missing 'path' or 'content' in request body" });
        }

        const backendRoot = path.resolve(__dirname, "..");
        const absolutePath = path.resolve(backendRoot, requestedPath);

        if (!absolutePath.startsWith(backendRoot)) {
            return res.status(403).json({ error: "Access Denied: Path escapes server directory." });
        }

        const relative = path.relative(backendRoot, absolutePath);
        const firstSegment = relative.split(path.sep)[0];

        if (firstSegment !== "data") {
            return res.status(403).json({ error: "Access Denied: You are only allowed to upload/restore files inside the data/ folder." });
        }

        await fs.ensureDir(path.dirname(absolutePath));
        await fs.writeFile(absolutePath, content, "utf8");

        res.json({ success: true });
    } catch (err) {
        console.error("Failed to upload file:", err);
        res.status(500).json({ error: "Server error occurred during file upload." });
    }
});

// POST /api/sync/reset-analytics
// Admin route to wipe MongoDB Atlas collections to 0 for a fresh launch
router.post("/reset-analytics", checkAdminKey, async (req, res) => {
    try {
        const { getIsConnected } = require("../config/db");
        const View = require("../models/View");
        const Download = require("../models/Download");
        const Viewer = require("../models/Viewer");
        const AISearch = require("../models/AISearch");

        if (getIsConnected()) {
            await View.deleteMany({});
            await Download.deleteMany({});
            await Viewer.deleteMany({});
            await AISearch.deleteMany({});
            console.log("🧹 MongoDB Atlas wiped to 0 via Admin API.");
            return res.json({ success: true, message: "MongoDB Atlas analytics reset to 0" });
        } else {
            return res.status(400).json({ error: "MongoDB is not connected on server" });
        }
    } catch (err) {
        console.error("Failed to reset MongoDB analytics:", err);
        res.status(500).json({ error: "Failed to reset MongoDB analytics" });
    }
});

module.exports = router;
