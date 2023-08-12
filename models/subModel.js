const mongoose = require("mongoose");
const subSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userID: {type: String, required: true},
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
    MacAddress: {
      type: String,
      required: true,
    },
    walletKey: {
      type: String,
      required: true,
      unique: true,
    },
    HDRLAccountInfo: {type: String},
    FDRLAccountInfo: {type: String},
    PHRLAccountInfo: {type: String},
    HDRL: {type: String},
    FDRL: {type: String},
    ECRLAccountInfo: {type: String},
    WARLAccountInfo: {type: String},
    ECRL: {type: String},
    WARL: {type: String},
    PHRL: {type: String},
    durationInMinutes: {type: String},
    startTime: {type: String},
    nextTime: {type: String},
    endSub: {type: String},
    noOfTransaction: {type: Number, default: 0},
    phValues: {
      type: [String],
      default: [],
    },
    ecValues: {
      type: [String],
      default: [],
    },
    waterValues: {
      type: [String],
      default: [],
    },
    tempValues: {
      type: [String],
      default: [],
    },
    humidValues: {
      type: [String],
      default: [],
    },
    time: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Sub = mongoose.model("subs", subSchema);
module.exports = Sub;
