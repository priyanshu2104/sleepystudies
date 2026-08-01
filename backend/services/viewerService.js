const crypto = require("crypto");
const { readJSON, writeJSON } = require("../utils/file");
const { getIsConnected } = require("../config/db");
const Viewer = require("../models/Viewer");

async function getViewer(viewerId) {
    if (getIsConnected()) {
        try {
            const v = await Viewer.findOne({ viewerId }).lean();
            if (v) return v;
        } catch (err) {}
    }
    const viewers = readJSON("viewers.json");
    return viewers.find(v => v.viewerId === viewerId);
}

async function createViewer(name, req) {
    const viewerId = crypto.randomBytes(4).toString("hex").toUpperCase();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const browser = req.headers["user-agent"];
    const now = new Date();

    const viewerObj = {
        viewerId,
        name,
        ip,
        browser,
        firstVisit: now,
        lastVisit: now,
    };

    if (getIsConnected()) {
        try {
            await Viewer.create(viewerObj);
        } catch (err) {
            console.error("Failed to create viewer in MongoDB:", err.message);
        }
    }

    try {
        const viewers = readJSON("viewers.json");
        viewers.push({
            ...viewerObj,
            firstVisit: now.toISOString(),
            lastVisit: now.toISOString(),
        });
        writeJSON("viewers.json", viewers);
    } catch (e) {}

    return viewerObj;
}

async function updateLastVisit(viewerId) {
    const now = new Date();

    if (getIsConnected()) {
        try {
            await Viewer.updateOne({ viewerId }, { $set: { lastVisit: now } });
        } catch (err) {}
    }

    try {
        const viewers = readJSON("viewers.json");
        const viewer = viewers.find(v => v.viewerId === viewerId);
        if (viewer) {
            viewer.lastVisit = now.toISOString();
            writeJSON("viewers.json", viewers);
        }
    } catch (e) {}
}

async function ensureViewerExists(viewerId, name, req) {
    if (!viewerId) return null;

    let viewer = await getViewer(viewerId);
    if (!viewer && name) {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const browser = req.headers["user-agent"];
        const now = new Date();

        const newViewer = {
            viewerId,
            name,
            ip,
            browser,
            firstVisit: now,
            lastVisit: now,
        };

        if (getIsConnected()) {
            try {
                await Viewer.create(newViewer);
            } catch (err) {}
        }

        try {
            const viewers = readJSON("viewers.json");
            viewers.push({
                ...newViewer,
                firstVisit: now.toISOString(),
                lastVisit: now.toISOString(),
            });
            writeJSON("viewers.json", viewers);
        } catch (e) {}

        viewer = newViewer;
    }

    return viewer;
}

module.exports = {
    getViewer,
    createViewer,
    updateLastVisit,
    ensureViewerExists,
};