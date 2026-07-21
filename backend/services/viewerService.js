const crypto = require("crypto");

const {
    readJSON,
    writeJSON,
} = require("../utils/file");

function getViewer(viewerId) {

    const viewers = readJSON("viewers.json");

    return viewers.find(
        v => v.viewerId === viewerId
    );
}

function createViewer(name, req) {

    const viewers = readJSON("viewers.json");

    const viewer = {

        viewerId: crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase(),

        name,

        ip:
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress,

        browser:
            req.headers["user-agent"],

        firstVisit:
            new Date().toISOString(),

        lastVisit:
            new Date().toISOString(),

    };

    viewers.push(viewer);

    writeJSON(
        "viewers.json",
        viewers
    );

    return viewer;
}

function updateLastVisit(viewerId) {

    const viewers = readJSON("viewers.json");

    const viewer = viewers.find(
        v => v.viewerId === viewerId
    );

    if (!viewer) return;

    viewer.lastVisit =
        new Date().toISOString();

    writeJSON(
        "viewers.json",
        viewers
    );
}

function ensureViewerExists(viewerId, name, req) {
    if (!viewerId) return null;

    const viewers = readJSON("viewers.json");
    let viewer = viewers.find(v => v.viewerId === viewerId);

    if (!viewer && name) {
        viewer = {
            viewerId,
            name,
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            browser: req.headers["user-agent"],
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
        };
        viewers.push(viewer);
        writeJSON("viewers.json", viewers);
    }

    return viewer;
}

module.exports = {

    getViewer,

    createViewer,

    updateLastVisit,

    ensureViewerExists,

};