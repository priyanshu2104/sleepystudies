const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const { formatNoteTitle } = require("../utils/titleHelper");

const router = express.Router();

const PDF_ROOT = path.join(__dirname, "..", "pdfs");

/*
GET /notes
Returns all subjects with note count
*/

router.get("/", async (req, res) => {
    const semesters = [];

    if (!(await fs.pathExists(PDF_ROOT))) {
        return res.json([]);
    }

    const semFolders = (await fs.readdir(PDF_ROOT)).sort();

    for (const semFolder of semFolders) {
        const semPath = path.join(PDF_ROOT, semFolder);
        const semStat = await fs.stat(semPath);

        if (!semStat.isDirectory()) continue;

        const subjects = [];
        const subjFolders = await fs.readdir(semPath);

        for (const subjFolder of subjFolders) {
            const subjPath = path.join(semPath, subjFolder);
            const subjStat = await fs.stat(subjPath);

            if (!subjStat.isDirectory()) continue;

            const files = (await fs.readdir(subjPath))
                .filter(file => file.endsWith(".pdf"));

            if (!files.length) continue;

            subjects.push({
                slug: subjFolder,
                title: subjFolder
                    .split("-")
                    .map(word => {
                        const upper = word.toUpperCase();
                        if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i.test(word)) {
                            return upper;
                        }
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    })
                    .join(" "),
                notes: files.length,
            });
        }

        if (subjects.length > 0) {
            semesters.push({
                semester: semFolder
                    .split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" "),
                slug: semFolder,
                subjects: subjects
            });
        }
    }

    res.json(semesters);
});

/*
GET /notes/overall-stats
Returns dynamic catalog statistics (total subjects, total notes, total views, total downloads)
*/
router.get("/overall-stats", async (req, res) => {
    try {
        const { readJSON } = require("../utils/file");
        const viewsCount = readJSON("views.json").length;
        const downloadsCount = readJSON("downloads.json").length;

        // Load non-sensitive public baseline stats for Render restarts
        let baseViews = 0;
        let baseDownloads = 0;
        const baselinePath = path.join(__dirname, "..", "config", "baseline.json");
        if (await fs.pathExists(baselinePath)) {
            try {
                const baseline = await fs.readJson(baselinePath);
                baseViews = baseline.baseViews || 0;
                baseDownloads = baseline.baseDownloads || 0;
            } catch (e) {}
        }

        let totalSubjects = 0;
        let totalNotes = 0;

        if (await fs.pathExists(PDF_ROOT)) {
            const semFolders = await fs.readdir(PDF_ROOT);
            for (const semFolder of semFolders) {
                const semPath = path.join(PDF_ROOT, semFolder);
                const semStat = await fs.stat(semPath);
                if (!semStat.isDirectory()) continue;

                const subjFolders = await fs.readdir(semPath);
                for (const subjFolder of subjFolders) {
                    const subjPath = path.join(semPath, subjFolder);
                    const subjStat = await fs.stat(subjPath);
                    if (!subjStat.isDirectory()) continue;

                    const files = (await fs.readdir(subjPath))
                        .filter(file => file.endsWith(".pdf"));

                    if (files.length > 0) {
                        totalSubjects++;
                        totalNotes += files.length;
                    }
                }
            }
        }

        const computedViews = (viewsCount >= baseViews && baseViews > 0) ? viewsCount : (baseViews + viewsCount);
        const computedDownloads = (downloadsCount >= baseDownloads && baseDownloads > 0) ? downloadsCount : (baseDownloads + downloadsCount);

        res.json({
            subjects: totalSubjects,
            notes: totalNotes,
            views: computedViews,
            downloads: computedDownloads,
        });
    } catch (err) {
        console.error("Failed to compute stats:", err);
        res.status(500).json({ error: "Failed to compute stats" });
    }
});

/*
GET /notes/:semester/:subject
Returns all PDFs inside one subject under a semester
*/

router.get("/:semester/:subject", async (req, res) => {
    const { semester, subject } = req.params;

    const folder = path.join(
        PDF_ROOT,
        semester,
        subject
    );

    if (!(await fs.pathExists(folder))) {
        return res.status(404).json([]);
    }

    const files = (await fs.readdir(folder))
        .filter(file => file.endsWith(".pdf"));

    const { readJSON } = require("../utils/file");
    const viewsList = readJSON("views.json");
    const downloadsList = readJSON("downloads.json");

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const notes = await Promise.all(files.map(async file => {
        const noteSlug = file.replace(".pdf", "");
        const imageDir = path.join(__dirname, "..", "images", semester, subject, noteSlug);
        
        let thumbnail = null;
        if (await fs.pathExists(imageDir)) {
            const imgFiles = (await fs.readdir(imageDir))
                .filter(f => f.endsWith(".png"))
                .sort();
            if (imgFiles.length > 0) {
                thumbnail = `${baseUrl}/images/${semester}/${subject}/${noteSlug}/${imgFiles[0]}`;
            }
        }

        const views = viewsList.filter(v => v.subject === subject && v.note === file).length;
        const downloads = downloadsList.filter(d => d.subject === subject && d.note === file).length;

        return {
            title: formatNoteTitle(file),
            file,
            subject,
            semester,
            thumbnail,
            views,
            downloads
        };
    }));

    res.json(notes);
});

module.exports = router;