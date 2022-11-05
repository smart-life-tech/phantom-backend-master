const express = require("express");
const {registerUser, authUser,updateUser} = require("../controllers/userControllers")

const router = express.Router();

router.route("/").post(registerUser)
router.route("/").put(updateUser)
router.route("/login").post(authUser)


module.exports = router; 