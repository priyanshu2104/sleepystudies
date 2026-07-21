const { readJSON, writeJSON } = require("../utils/file");

function recordDownload(data) {
    const downloads = readJSON("downloads.json");

    downloads.push({
        id: Date.now(),
        viewerId: data.viewerId || null,
        name: data.name || null,
        semester: data.semester,
        subject: data.subject,
        note: data.note,
        ip: data.ip,
        browser: data.browser,
        downloadedAt: new Date().toISOString(),
    });

    writeJSON("downloads.json", downloads);
}

module.exports = {
    recordDownload,
};
