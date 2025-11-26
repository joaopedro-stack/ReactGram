const express = require("express");
const router = express.Router();

router.use('/users', require('./UserRoutes'));
router.use('/photos', require('./PhotoRoutes'));

router.get("/", (req, res) => {
    res.send("API Working!");
});

module.exports = router;
