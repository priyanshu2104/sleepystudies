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

    const results = searchNotes(q);

    res.json(results);

});

module.exports = router;