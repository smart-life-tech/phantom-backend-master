const mongoose = require("mongoose");
const subSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subRatePerMin: {
      type: Number,
      required: true,
    },
    hasActiveSub: {
      type: Boolean,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sub = mongoose.model("Sub", subSchema);
module.exports = Sub