const { execSync } = require("child_process");

function getPdfPageCount(pdfPath, password = "SleepyStudiesSecurityPass2026") {
    try {
        const output = execSync(`pdfinfo -upw "${password}" "${pdfPath}"`, { timeout: 4000, encoding: "utf8" });
        const match = output.match(/Pages:\s+(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
    } catch (e) {
        try {
            const output = execSync(`pdfinfo "${pdfPath}"`, { timeout: 4000, encoding: "utf8" });
            const match = output.match(/Pages:\s+(\d+)/);
            if (match && match[1]) {
                return parseInt(match[1], 10);
            }
        } catch (err) {}
    }
    return 1;
}

module.exports = { getPdfPageCount };
