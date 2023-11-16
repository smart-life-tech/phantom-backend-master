const express = require("express");
const {
  registerUser,
  authUser,
  updateUser,
  submitOrderNumber,
  getAllOrders,
  getAllUserOrders,
  updateOrder,
} = require("../controllers/userControllers");

const router = express.Router();

router.route("/").post(registerUser);
router.route("/").put(updateUser);
router.route("/login").post(authUser);
router.route("/order-number").post(submitOrderNumber);
router.route("/orders").get(getAllUserOrders);
router.route("/admin/orders").get(getAllOrders);
router.route("/admin/update-order").post(updateOrder);

module.exports = router;
