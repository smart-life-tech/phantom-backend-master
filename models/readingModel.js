const mongoose = require("mongoose");
// const readingsSchema = mongoose.Schema(

//   {

//    "24:62:AB:FC:A8:4C":{
//     IP:String,
//     RSSI:String,
//     type:String,
//     name:String,
//     chipid:String,
//     bootCount:Number,
//     wakeup_reason:String,
//     temperature:Number,
//     humidity:Number,
//     phVal:Number
//   },
//     ts:{type:Date}
  
   
//   }
// );

const readingsSchema = new mongoose.Schema({
  // dynamicKey: {
  //   type: Map,
  //   of: new mongoose.Schema({
  //     IP: { type: String },
  //     RSSI: { type: String },
  //     type: { type: String },
  //     name: { type: String },
  //     bootCount: { type: Number },
  //     wakeup_reason: { type: String },
  //     temperature: { type: Number },
  //     humidity: { type: Number },
  //     phVal: { type: Number }
  //   }, { _id: false })
  // }
  dynamicObject: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  ts: {
    type: String,
  },
});


const Readings = mongoose.model("Readings", readingsSchema);
module.exports = Readings