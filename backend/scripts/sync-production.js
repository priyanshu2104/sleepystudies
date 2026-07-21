require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");

const PRODUCTION_API_URL = "https://sleepystudies-api.onrender.com";

async function runSync() {
    const adminKey = process.env.ADMIN_LOGS_KEY;
    if (!adminKey || adminKey.trim() === "") {
        console.error("\x1b[31m[ERROR] ADMIN_LOGS_KEY is not defined in your local .env file.\x1b[0m");
        console.log("Please add it to backend/.env like this:");
        console.log("ADMIN_LOGS_KEY=your_secure_secret_key\n");
        process.exit(1);
    }

    console.log("📡 Connecting to SleepyStudies Production Server...");
    console.log(`🔗 API URL: ${PRODUCTION_API_URL}`);

    const backendRoot = path.resolve(__dirname, "..");

    try {
        // 1. Fetch Manifest
        const response = await fetch(`${PRODUCTION_API_URL}/api/sync/manifest`, {
            headers: {
                "x-admin-token": adminKey,
            },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const serverFiles = await response.json();
        console.log(`📦 Manifest received: Server has ${serverFiles.length} files to track.\n`);

        let downloadCount = 0;
        let skipCount = 0;

        // 2. Compare and sync files
        for (const item of serverFiles) {
            const localPath = path.join(backendRoot, item.path);
            let shouldDownload = false;

            if (!(await fs.pathExists(localPath))) {
                shouldDownload = true;
            } else {
                const stat = await fs.stat(localPath);
                // If local size is different, or server modification time is newer
                if (stat.size !== item.size) {
                    shouldDownload = true;
                }
            }

            if (shouldDownload) {
                console.log(`📥 Downloading: ${item.path} (${(item.size / 1024).toFixed(1)} KB)...`);
                
                const fileRes = await fetch(
                    `${PRODUCTION_API_URL}/api/sync/file?path=${encodeURIComponent(item.path)}`,
                    {
                        headers: {
                            "x-admin-token": adminKey,
                        },
                    }
                );

                if (!fileRes.ok) {
                    throw new Error(`Failed to download ${item.path}: HTTP ${fileRes.status}`);
                }

                const arrayBuffer = await fileRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Ensure parent directory exists
                await fs.ensureDir(path.dirname(localPath));
                await fs.writeFile(localPath, buffer);

                // Update local modification time to match server's
                const serverTime = new Date(item.mtime);
                await fs.utimes(localPath, serverTime, serverTime);

                downloadCount++;
            } else {
                skipCount++;
            }
        }

        console.log("\n\x1b[32m[SUCCESS] Synchronization complete!\x1b[0m");
        console.log(`✨ Status Summary:`);
        console.log(`   - Files downloaded / updated: ${downloadCount}`);
        console.log(`   - Files already up-to-date:    ${skipCount}`);

    } catch (err) {
        console.error("\n\x1b[31m[ERROR] Synchronization failed:\x1b[0m", err.message);
        console.log("\nDouble-check that:");
        console.log("1. Your Render backend is awake and running.");
        console.log("2. Your ADMIN_LOGS_KEY matches the environment variable configured on Render.");
        process.exit(1);
    }
}

runSync();
