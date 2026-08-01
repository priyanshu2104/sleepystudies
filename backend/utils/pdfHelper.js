const { execSync } = require("child_process");
const fs = require("fs");

const pageCountCache = new Map();

function getPdfPageCount(pdfPath, password = "SleepyStudiesSecurityPass2026") {
    let stat;
    try {
        stat = fs.statSync(pdfPath);
    } catch (e) {
        return 1;
    }

    const cacheKey = `${pdfPath}:${stat.mtimeMs}`;
    if (pageCountCache.has(cacheKey)) {
        return pageCountCache.get(cacheKey);
    }

    let count = 1;

    try {
        const output = execSync(`pdfinfo -upw "${password}" "${pdfPath}"`, { timeout: 4000, encoding: "utf8" });
        const match = output.match(/Pages:\s+(\d+)/);
        if (match && match[1]) {
            count = parseInt(match[1], 10);
        }
    } catch (e) {
        try {
            const output = execSync(`pdfinfo "${pdfPath}"`, { timeout: 4000, encoding: "utf8" });
            const match = output.match(/Pages:\s+(\d+)/);
            if (match && match[1]) {
                count = parseInt(match[1], 10);
            }
        } catch (err) {}
    }

    pageCountCache.set(cacheKey, count);
    return count;
}

module.exports = { getPdfPageCount };
