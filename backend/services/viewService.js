const {
    readJSON,
    writeJSON,
} = require("../utils/file");

function recordView(data) {
    const views = readJSON("views.json");

    views.push({
        id: Date.now(),
        viewerId: data.viewerId,
        name: data.name || null,
        subject: data.subject,
        note: data.note,
        ip: data.ip,
        browser: data.browser,
        openedAt: new Date().toISOString(),
    });

    writeJSON("views.json", views);
}

module.exports = {
    recordView,
};