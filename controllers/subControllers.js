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

const createSub = asyncHandler(async (req, res) => {
  const {
    name,
    subRatePerMin,
    hasActiveSub,
    email,
    durationInMinutes,
    MacAddress,
  } = req.body;
  console.log(12344);
  try {
    console.log({name, subRatePerMin, hasActiveSub, email, durationInMinutes});

    const user = checkToken(req.headers.authorization.split(" ")[1]);
    const userInfo = await User.findById(user.id);
    const subInfo = await Sub.findOne({email});
    console.log({subInfo});
    // const reading =await Readings.find({[`$dynamicKey.${MacAddress}`]: { "$exists": true } })
    // console.log({reading},reading[MacAddress])
    const {startTime, nextTime, endSub} = changeFrequencyTodays(subRatePerMin);
    console.log({startTime, nextTime, endSub});
    if (userInfo) {
      if (subInfo) {
        console.log("you have a sub");
      } else {
        let splsTokens = await createCustomTokenForUser(userInfo.walletKey);
        console.log({splsTokens});

        const {startTime, nextTime, endSub} =
          changeFrequencyTodays(subRatePerMin);
        console.log({startTime, nextTime, endSub});
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
            noOfTransaction: 0,
          });
          // const reading = Readings.findOne({[`${'24:62:AB:FC:A8:4C'}.name`]: { "$exists": true } })
          const reading = Readings.findOne({
            [`${userSub.MacAddress}.name`]: {$exists: true},
          });
          console.log({userSub, reading});
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
    console.log({userInfo});
  } catch (e) {
    console.log({e});
  }
});

const getSub = asyncHandler(async (req, res) => {
  try {
    const user = checkToken(req.headers.authorization.split(" ")[1]);
    console.log({user});
    const userInfo = await User.findById(user.id);
    if (userInfo) {
      console.log(8828289);
      const {IP} = req.body;
      console.log({IP});

      const readingData = await Readings.find();
      console.log({readingData});
      const readings = readingData.filter((reading) => {
        const resultObj = reading.toObject();
        return resultObj[IP];
      });
      console.log(readings[readings.length - 1], "ieiei");
      const latestReading = readings[readings.length - 1]
        ? readings[readings.length - 1].toObject()
        : null;
      if (latestReading) {
        const updateMac = await User.findByIdAndUpdate(
          user.id,
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
  console.log({MacAddress}, "kkeokeookeko");
  // MacAddress ="24:62:AB:FC:A8:4C"
  // const reading =await Readings.find({[`$dynamicKey.${'24:682:AB:FC:A8:49'}.name`]: { "$exists": true } })
  const readingData = await Readings.find();
  console.log({readingData});
  const readings = readingData.filter((reading) => {
    const resultObj = reading.toObject();
    return resultObj[MacAddress];
  });
  if (readings) {
    if (val) {
      const latestReading = readings[readings.length - 1]
        ? readings.slice(readings.length - 10)
        : readings[readings.length - 1];
      console.log({latestReading}, readings.slice(readings.length - 10));
      const array = latestReading.map((reading) => {
        console.log({reading});
        return reading.toObject()[MacAddress];
      });
      return array;
    } else {
      const latestReading = readings[readings.length - 1]
        ? readings[readings.length - 1].toObject()
        : readings[readings.length - 1];
      console.log({latestReading});
      const {temperature, humidity, phVal} = latestReading[MacAddress];
      const ts = latestReading[MacAddress].ts;
      return {temperature, humidity, phVal, date: ts ?? new Date()};
    }
  } else {
    return {temperature: "", humidity: "", phVal: ""};
  }
};

const getLatestSubData = asyncHandler(async (req, res) => {
  console.log(";et go");
  const user = checkToken(req.headers.authorization.split(" ")[1]);
  const userInfo = await User.findById(user.id);
  console.log({userInfo});

  if (userInfo.MacAddress) {
    const sub = await Sub.findOne({email: userInfo.email});
    console.log({sub});

    if (sub) {
      res.json({
        tempToken: sub.FDRLAccountInfo,
        humidityToken: sub.HDRLAccountInfo,
        phToken: sub.PHRLAccountInfo,
        walletAddress: sub.walletKey,
        status: true,
        interval: userInfo.subRatePerMin,
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
  console.log(";et go");
  const user = checkToken(req.headers.authorization.split(" ")[1]);
  const userInfo = await User.findById(user.id);

  if (userInfo) {
    res.json({
      data: userInfo,
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
