const express = require("express");

const router = express.Router();

const {

    getViewer,

    createViewer,

    updateLastVisit,

} = require("../services/viewerService");

router.post("/", (req, res) => {

    const {

        name,

        viewerId,

    } = req.body;

    if (viewerId) {

        const viewer =
            getViewer(viewerId);

        if (viewer) {

            updateLastVisit(viewerId);

            return res.json(viewer);

        }

    }

    if (!name) {

        return res.status(400).json({

            error:
                "Name required",

        });

    }

    const viewer =
        createViewer(name, req);

    res.json(viewer);

});

module.exports = router;