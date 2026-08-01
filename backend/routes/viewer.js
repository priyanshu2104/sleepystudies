const express = require("express");

const router = express.Router();

const {

    getViewer,

    createViewer,

    updateLastVisit,

} = require("../services/viewerService");

router.post("/", async (req, res) => {
    try {
        const { name, viewerId } = req.body;

        if (viewerId) {
            const viewer = await getViewer(viewerId);
            if (viewer) {
                await updateLastVisit(viewerId);
                return res.json(viewer);
            }
        }

        if (!name) {
            return res.status(400).json({
                error: "Name required",
            });
        }

        const viewer = await createViewer(name, req);
        res.json(viewer);
    } catch (err) {
        console.error("Viewer route error:", err);
        res.status(500).json({ error: "Failed to process viewer request" });
    }
});

module.exports = router;