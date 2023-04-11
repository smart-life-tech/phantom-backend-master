const asyncHandler = require("express-async-handler")
const Sub = require("../models/subModel");
const generateToken = require("../utils/generateToken");

const createSub = asyncHandler(async (req, res) => {
  const { name, subRatePerMin, hasSubActiveSub, email } = req.body;



  const user = await Sub.create({
    name,
    subRatePerMin,
    hasSubActiveSub,
    email
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      subRatePerMin: user.subRatePerMin,
      hasSubActiveSub: user.hasSubActiveSub,
      email: user.email,
      createdAt: user.createdAt
    })
  } else {
    res.status(400)
    throw new Error("Error Occurred !")
  }


})




const getSub = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Sub.findOne({ email });
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      subRatePerMin: user.subRatePerMin,
      hasSubActiveSub: user.hasSubActiveSub,
      createdAt: user.createdAt
    })
  } else {
    res.status(400)
    throw new Error("Invalid email or password !")
  }


})


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

module.exports = { createSub, getSub/*, updateUser */ }