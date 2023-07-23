const express = require("express");
const { createSub, getSub } = require("../controllers/subControllers")

const router = express.Router();

router.route("/").post(createSub)
router.route("/").get(getSub)


module.exports = router; 