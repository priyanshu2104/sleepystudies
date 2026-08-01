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

            let latestMtime = 0;
            for (const file of files) {
                const fStat = await fs.stat(path.join(subjPath, file));
                if (fStat.mtimeMs > latestMtime) {
                    latestMtime = fStat.mtimeMs;
                }
            }

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
                updatedAt: latestMtime,
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
        const { getIsConnected } = require("../config/db");
        const View = require("../models/View");
        const Download = require("../models/Download");
        const { readJSON } = require("../utils/file");

        let computedViews = 0;
        let computedDownloads = 0;

        if (getIsConnected()) {
            computedViews = await View.countDocuments();
            computedDownloads = await Download.countDocuments();
        } else {
            const viewsCount = readJSON("views.json").length;
            const downloadsCount = readJSON("downloads.json").length;

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

            computedViews = (viewsCount >= baseViews && baseViews > 0) ? viewsCount : (baseViews + viewsCount);
            computedDownloads = (downloadsCount >= baseDownloads && baseDownloads > 0) ? downloadsCount : (baseDownloads + downloadsCount);
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

    const { getIsConnected } = require("../config/db");
    const View = require("../models/View");
    const Download = require("../models/Download");
    const { readJSON } = require("../utils/file");

    const isDb = getIsConnected();
    let viewsList = [];
    let downloadsList = [];
    let fileViewsMap = {};
    let fileDownloadsMap = {};

    if (!isDb) {
        viewsList = readJSON("views.json");
        downloadsList = readJSON("downloads.json");

        const baselinePath = path.join(__dirname, "..", "config", "baseline.json");
        if (await fs.pathExists(baselinePath)) {
            try {
                const baseline = await fs.readJson(baselinePath);
                fileViewsMap = baseline.fileViews || {};
                fileDownloadsMap = baseline.fileDownloads || {};
            } catch (e) {}
        }
    }

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const notes = await Promise.all(files.map(async file => {
        const noteSlug = file.replace(".pdf", "");
        const thumbnail = `${baseUrl}/images/${semester}/${subject}/${noteSlug}/page-1.png`;

        let finalViews = 0;
        let finalDownloads = 0;

        if (isDb) {
            finalViews = await View.countDocuments({
                $or: [{ subject }, { subject: `${semester}/${subject}` }],
                note: file,
            });
            finalDownloads = await Download.countDocuments({
                $or: [{ subject }, { subject: `${semester}/${subject}` }],
                note: file,
            });
        } else {
            const fileKey = `${semester}/${subject}/${file}`;
            const baseV = fileViewsMap[fileKey] || 0;
            const baseD = fileDownloadsMap[fileKey] || 0;

            const currentViews = viewsList.filter(v => (v.subject === subject || v.subject === `${semester}/${subject}`) && v.note === file).length;
            const currentDownloads = downloadsList.filter(d => (d.subject === subject || d.subject === `${semester}/${subject}`) && d.note === file).length;

            finalViews = (currentViews >= baseV && baseV > 0) ? currentViews : (baseV + currentViews);
            finalDownloads = (currentDownloads >= baseD && baseD > 0) ? currentDownloads : (baseD + currentDownloads);
        }

        return {
            title: formatNoteTitle(file),
            file,
            subject,
            semester,
            thumbnail,
            views: finalViews,
            downloads: finalDownloads
        };
    }));

    res.json(notes);
});

module.exports = router;