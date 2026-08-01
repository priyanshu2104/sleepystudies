const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fs = require("fs-extra");

const { connectDB, getIsConnected } = require("../config/db");
const View = require("../models/View");
const Download = require("../models/Download");
const Viewer = require("../models/Viewer");

async function resetAll() {
    console.log("🧹 Starting Analytics & Counts Fresh Launch Reset...");

    // 1. Reset Local JSON files
    const dataDir = path.join(__dirname, "..", "data");
    await fs.ensureDir(dataDir);

    await fs.writeJson(path.join(dataDir, "views.json"), [], { spaces: 4 });
    await fs.writeJson(path.join(dataDir, "downloads.json"), [], { spaces: 4 });
    await fs.writeJson(path.join(dataDir, "viewers.json"), [], { spaces: 4 });
    console.log("✅ Local JSON files (views.json, downloads.json, viewers.json) reset to [].");

    // 2. Reset Baseline JSON config
    const baselinePath = path.join(__dirname, "..", "config", "baseline.json");
    const emptyBaseline = {
        baseViews: 0,
        baseDownloads: 0,
        fileViews: {},
        fileDownloads: {},
    };
    await fs.writeJson(baselinePath, emptyBaseline, { spaces: 4 });
    console.log("✅ Config baseline.json reset to 0.");

    // 3. Reset MongoDB Atlas (if connected)
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.trim() !== "") {
        console.log("📡 Connecting to MongoDB Atlas...");
        const connected = await connectDB();
        if (connected && getIsConnected()) {
            await View.deleteMany({});
            await Download.deleteMany({});
            await Viewer.deleteMany({});
            console.log("✅ MongoDB Atlas collections (views, downloads, viewers) wiped clean to 0.");
        }
    }

    console.log("\n✨ RESET COMPLETE! Your application is now at exact 0 stats, ready for a fresh public launch!");
    process.exit(0);
}

resetAll();
