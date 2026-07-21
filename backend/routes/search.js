const express = require("express");

const router = express.Router();

const {

    searchNotes,

} = require("../services/searchService");

router.get("/", (req, res) => {
    const q = req.query.q || "";

    if (!q.trim()) {
        return res.json([]);
    }

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const results = searchNotes(q, baseUrl);
    res.json(results);
});

module.exports = router;