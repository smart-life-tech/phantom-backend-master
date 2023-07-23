const mongoose = require("mongoose");

const readingsSchema = new mongoose.Schema({
  // dynamicObject: {
  //   type: mongoose.Schema.Types.Mixed,
  //   required: true,
  // },
  // ts: {
  //   type: String,
  // },
  // name: {
  //   type: String,
  // },
  _id: {type: mongoose.ObjectId},
  macAddress: {
    type: mongoose.SchemaTypes.Object,
    properties: {
      IP: {type: String},
      RSSI: {type: Number},
      type: {type: String},
      name: {type: String},
      bootCount: {type: Number},
      wakeup_reason: {type: String},
      temperature: {type: Number},
      humidity: {type: Number},
      phVal: {type: Number},
      ts: {type: Date},
      ecSensor: {type: Number},
      waiter: {type: Number},
      rain: {type: Number},
      waterlevel: {type: Number},
    },
  },
});

const Readings = mongoose.model("Readings", readingsSchema);
module.exports = Readings;
