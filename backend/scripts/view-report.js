const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fs = require("fs-extra");

const { connectDB, getIsConnected } = require("../config/db");
const View = require("../models/View");
const Download = require("../models/Download");
const Viewer = require("../models/Viewer");
const AISearch = require("../models/AISearch");
const { readJSON } = require("../utils/file");

async function generateReport() {
    console.log("=================================================");
    console.log("📊  SLEEPYSTUDIES LOCAL ANALYTICS & VIEW REPORT  ");
    console.log("=================================================\n");

    const mongoUri = process.env.MONGODB_URI;
    let isDb = false;

    if (mongoUri && mongoUri.trim() !== "") {
        console.log("📡 Connecting to MongoDB Atlas Cloud Database...");
        isDb = await connectDB();
    }

    let viewsList = [];
    let downloadsList = [];
    let viewersList = [];
    let aiSearchesList = [];

    if (isDb && getIsConnected()) {
        console.log("✅ Fetching live analytics data from MongoDB Atlas...\n");
        viewsList = await View.find({}).lean();
        downloadsList = await Download.find({}).lean();
        viewersList = await Viewer.find({}).lean();
        aiSearchesList = await AISearch.find({}).lean();
    } else {
        console.log("ℹ️ Reading analytics data from local JSON files...\n");
        viewsList = readJSON("views.json");
        downloadsList = readJSON("downloads.json");
        viewersList = readJSON("viewers.json");
        aiSearchesList = readJSON("aisearches.json");
    }

    // 1. Summary Statistics
    console.log("-------------------------------------------------");
    console.log("📌 OVERALL SUMMARY");
    console.log("-------------------------------------------------");
    console.log(`👁️  Total Views:      ${viewsList.length}`);
    console.log(`📥  Total Downloads:  ${downloadsList.length}`);
    console.log(`👤  Total Viewers:    ${viewersList.length}`);
    console.log(`🤖  Total AI Queries: ${aiSearchesList.length}\n`);

    // 2. Top Viewed Notes
    const viewCounts = {};
    viewsList.forEach(v => {
        const key = `${v.subject}/${v.note}`;
        viewCounts[key] = (viewCounts[key] || 0) + 1;
    });

    const topViews = Object.entries(viewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    console.log("-------------------------------------------------");
    console.log("🔥 TOP VIEWED NOTES");
    console.log("-------------------------------------------------");
    if (topViews.length === 0) {
        console.log("   (No view events recorded yet)");
    } else {
        topViews.forEach(([note, count], i) => {
            console.log(`   ${i + 1}. ${note} — ${count} views`);
        });
    }
    console.log("");

    // 3. Top Downloaded Notes
    const downloadCounts = {};
    downloadsList.forEach(d => {
        const key = `${d.subject}/${d.note}`;
        downloadCounts[key] = (downloadCounts[key] || 0) + 1;
    });

    const topDownloads = Object.entries(downloadCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    console.log("-------------------------------------------------");
    console.log("💾 TOP DOWNLOADED NOTES");
    console.log("-------------------------------------------------");
    if (topDownloads.length === 0) {
        console.log("   (No download events recorded yet)");
    } else {
        topDownloads.forEach(([note, count], i) => {
            console.log(`   ${i + 1}. ${note} — ${count} downloads`);
        });
    }
    console.log("");

    // 4. Confidential AI Queries Analytics
    console.log("-------------------------------------------------");
    console.log("🤖 RECENT CONFIDENTIAL AI QUERIES");
    console.log("-------------------------------------------------");
    if (aiSearchesList.length === 0) {
        console.log("   (No AI queries recorded yet)");
    } else {
        aiSearchesList.slice(-10).reverse().forEach((q, i) => {
            const queryText = q.prompt ? `"${q.prompt}"` : `[Mode: ${q.mode}]`;
            const student = q.viewerName ? `${q.viewerName} (ID: ${q.viewerId || "N/A"})` : (q.viewerId || "Anonymous");
            console.log(`   ${i + 1}. Student: ${student}`);
            console.log(`      Note: ${q.subject}/${q.note}`);
            console.log(`      Query: ${queryText} | IP: ${q.ip || q.ipHash || "anonymized"}`);
            console.log("");
        });
    }
    console.log("");

    // 5. Registered Students / Viewers
    console.log("-------------------------------------------------");
    console.log("🎓 REGISTERED STUDENTS / VIEWERS");
    console.log("-------------------------------------------------");
    if (viewersList.length === 0) {
        console.log("   (No registered viewers yet)");
    } else {
        viewersList.slice(0, 10).forEach((v, i) => {
            console.log(`   ${i + 1}. ${v.name} (ID: ${v.viewerId}) — Last visit: ${new Date(v.lastVisit).toLocaleString()}`);
        });
    }
    console.log("=================================================\n");

    process.exit(0);
}

generateReport();
