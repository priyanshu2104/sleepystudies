const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { connectDB, getIsConnected } = require("../config/db");
const { readJSON } = require("../utils/file");
const View = require("../models/View");
const Download = require("../models/Download");
const Viewer = require("../models/Viewer");

async function migrate() {
    console.log("🚀 Starting MongoDB Migration Script...");
    const connected = await connectDB();
    if (!connected) {
        console.error("❌ Could not connect to MongoDB. Make sure MONGODB_URI is set in backend/.env!");
        process.exit(1);
    }

    try {
        // 1. Migrate Viewers
        const viewers = readJSON("viewers.json");
        console.log(`📦 Found ${viewers.length} local viewers to migrate.`);
        let viewerCount = 0;
        for (const v of viewers) {
            await Viewer.updateOne(
                { viewerId: v.viewerId },
                {
                    $setOnInsert: {
                        viewerId: v.viewerId,
                        name: v.name,
                        ip: v.ip,
                        browser: v.browser,
                        firstVisit: v.firstVisit ? new Date(v.firstVisit) : new Date(),
                        lastVisit: v.lastVisit ? new Date(v.lastVisit) : new Date(),
                    },
                },
                { upsert: true }
            );
            viewerCount++;
        }
        console.log(`✅ Migrated ${viewerCount} viewers.`);

        // 2. Migrate Views
        const views = readJSON("views.json");
        console.log(`📦 Found ${views.length} local view events to migrate.`);
        let viewCount = 0;
        for (const v of views) {
            await View.updateOne(
                { id: v.id },
                {
                    $setOnInsert: {
                        id: v.id,
                        viewerId: v.viewerId,
                        name: v.name || null,
                        semester: v.semester || "semester-5",
                        subject: v.subject,
                        note: v.note,
                        ip: v.ip,
                        browser: v.browser,
                        openedAt: v.openedAt ? new Date(v.openedAt) : new Date(),
                    },
                },
                { upsert: true }
            );
            viewCount++;
        }
        console.log(`✅ Migrated ${viewCount} view events.`);

        // 3. Migrate Downloads
        const downloads = readJSON("downloads.json");
        console.log(`📦 Found ${downloads.length} local download events to migrate.`);
        let downloadCount = 0;
        for (const d of downloads) {
            await Download.updateOne(
                { id: d.id },
                {
                    $setOnInsert: {
                        id: d.id,
                        viewerId: d.viewerId || null,
                        name: d.name || null,
                        semester: d.semester || "semester-5",
                        subject: d.subject,
                        note: d.note,
                        ip: d.ip,
                        browser: d.browser,
                        downloadedAt: d.downloadedAt ? new Date(d.downloadedAt) : new Date(),
                    },
                },
                { upsert: true }
            );
            downloadCount++;
        }
        console.log(`✅ Migrated ${downloadCount} download events.`);

        console.log("\n🎉 Migration completed successfully! Your MongoDB Atlas cluster is fully populated.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
