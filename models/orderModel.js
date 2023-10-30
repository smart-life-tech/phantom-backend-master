const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    orderPlatform: {
      type: String,
      required: true,
    },
    orderEmail: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
