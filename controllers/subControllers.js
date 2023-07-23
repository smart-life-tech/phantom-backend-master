const asyncHandler = require("express-async-handler");
const Sub = require("../models/subModel");
const {
  generateToken,
  checkToken,
  createCustomTokenForUser,
  changeFrequencyTodays,
} = require("../utils/generateToken");
const Readings = require("../models/readingModel");
const User = require("../models/userModel");
const MongoClient = require("mongodb").MongoClient;

// Connection URL and database name
const url = process.env.MONGO_URI;
const dbName = "iot";

const createSub = asyncHandler(async (req, res) => {
  const {
    name,
    subRatePerMin,
    hasActiveSub,
    email,
    durationInMinutes,
    MacAddress,
  } = req.body;
  try {
    const user = checkToken(req.headers.authorization.split(" ")[1]);
    const userInfo = await User.findById(user.id);
    const subInfo = await Sub.findOne({email});

    const {startTime, nextTime, endSub} = changeFrequencyTodays(subRatePerMin);
    if (userInfo) {
      if (subInfo) {
      } else {
        let splsTokens = await createCustomTokenForUser(userInfo.walletKey);

        const {startTime, nextTime, endSub} =
          changeFrequencyTodays(subRatePerMin);
        if (splsTokens) {
          const userSub = await Sub.create({
            userID: userInfo._id,
            name,
            subRatePerMin,
            hasActiveSub,
            MacAddress,
            walletKey: userInfo.walletKey,
            email,
            durationInMinutes,
            ...splsTokens,
            startTime,
            nextTime,
            endSub,
            phValues: [],
            tempValues: [],
            humidValues: [],
            time: [],
            noOfTransaction: 0,
          });
          // const reading = Readings.findOne({[`${'24:62:AB:FC:A8:4C'}.name`]: { "$exists": true } })
          const reading = Readings.findOne({
            [`${userSub.MacAddress}.name`]: {$exists: true},
          });
          res.status(201).json({
            // _id: userSub._id,
            // name: userSub.name,
            // subRatePerMin: userSub.subRatePerMin,
            // hasActiveSub: userSub.hasActiveSub,
            // email: userSub.email,
            // createdAt: userSub.createdAt
            ...userSub,
          });
        } else {
          console.log("token creating failed");
        }
      }
    } else {
      console.log("errorn");
      res.status(400);
      throw new Error("Error Occurred !");
    }
  } catch (e) {
    console.log({e});
  }
});

const getSub = asyncHandler(async (req, res) => {
  try {
    const user = checkToken(req.headers.authorization.split(" ")[1]);

    const userInfo = await User.findById(user.id);
    if (userInfo) {
      const {IP} = req.body;

      const readingData = await Readings.find();
      const readings = readingData.filter((reading) => {
        const resultObj = reading.toObject();
        return resultObj[IP];
      });
      const latestReading = readings[readings.length - 1]
        ? readings[readings.length - 1].toObject()
        : null;
      console.log("UPDATING");
      if (latestReading) {
        const updateMac = await User.findByIdAndUpdate(
          user.id,
          {
            MacAddress: IP,
          },
          {new: true}
        );
        console.log({updateMac, userInfo});
        const subInfo = await Sub.findOne({email: userInfo.email});
        console.log({subInfo});
        await Sub.findByIdAndUpdate(
          subInfo.id,
          {
            MacAddress: IP,
          },
          {new: true}
        );
        res.json({
          reading: latestReading,
          status: true,
        });
      } else {
        res.json({
          message: "not found",
          status: false,
        });
      }
    }
  } catch (e) {
    console.log({e});
  }
});

const findUserReadings = async (MacAddress, val = false) => {
  // MacAddress ="24:62:AB:FC:A8:4C"
  // const reading =await Readings.find({[`$dynamicKey.${'24:682:AB:FC:A8:49'}.name`]: { "$exists": true } })
  const readingData = await Readings.find();
  const readings = readingData.filter((reading) => {
    const resultObj = reading.toObject();
    return resultObj[MacAddress];
  });
  if (readings) {
    if (val) {
      const latestReading = readings[readings.length - 1]
        ? readings.slice(readings.length - 10)
        : readings[readings.length - 1];
      const array = latestReading.map((reading) => {
        return reading.toObject()[MacAddress];
      });
      return array;
    } else {
      const latestReading = readings[readings.length - 1]
        ? readings[readings.length - 1].toObject()
        : readings[readings.length - 1];
      console.log({latestReading});
      const {
        temperature,
        humidity,
        phVal,
        ph1,
        ph2,
        water,
        ecSensor,
        waterlevel,
      } = latestReading[MacAddress];
      const ts = latestReading[MacAddress].ts;
      return {
        temperature,
        humidity,
        phVal,
        ph1,
        ph2,
        water,
        ecSensor,
        waterlevel,
        date: ts ?? new Date(),
      };
    }
  } else {
    return {temperature: "", humidity: "", phVal: ""};
  }
};

const getLatestSubData = asyncHandler(async (req, res) => {
  const user = checkToken(req.headers.authorization.split(" ")[1]);
  const userInfo = await User.findById(user.id);

  if (userInfo.MacAddress) {
    const sub = await Sub.findOne({email: userInfo.email});
    if (sub) {
      res.json({
        tempToken: sub.FDRLAccountInfo,
        ecToken: sub.ECRLAccountInfo,
        waterToken: sub.WARLAccountInfo,
        humidityToken: sub.HDRLAccountInfo,
        phToken: sub.PHRLAccountInfo,
        walletAddress: sub.walletKey,
        status: true,
        interval: userInfo.subRatePerMin,
        time: sub.time,
        phValues: sub.phValues,
        ecValues: sub.ecValues,
        waterValues: sub.waterValues,
        tempValues: sub.tempValues,
        humidValues: sub.humidValues,
      });
    } else {
      res.json({
        message: "Not found",
        status: false,
      });
    }
  } else {
    res.json({
      message: "Not found",
      status: false,
    });
  }
});

const getDataInfo = asyncHandler(async (req, res) => {
  const user = checkToken(req.headers.authorization.split(" ")[1]);
  const userInfo = await User.findById(user.id);
  const findUserData = await findUserReadings(userInfo.MacAddress);
  if (userInfo) {
    res.json({
      data: {MacAddress: userInfo.MacAddress, _id: userInfo._id},
      extra: {...findUserData},
      status: true,
    });
  } else {
    res.json({
      message: "Not found",
      status: false,
    });
  }
});
const getAllSubData = async () => {
  const subData = await Sub.find();
  return subData;
};

// const updateUser = asyncHandler(async (req, res) => {
//   const { email, key } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) {
//     res.status(400)
//     throw new Error("User does not exists")
//   }

//   const user1 = await User.updateOne({ _id: user._id }, { $set: { walletKey: key } })
//   if (user) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       pic: user.pic,
//       walletKey: key,
//       token: generateToken(user._id)
//     })
//   }

// })

module.exports = {
  createSub,
  getSub /*, updateUser */,
  getLatestSubData,
  getAllSubData,
  findUserReadings,
  getDataInfo,
};
