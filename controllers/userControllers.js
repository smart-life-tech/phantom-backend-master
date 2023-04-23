const asyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const {generateToken} = require("../utils/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400)
    throw new Error("User exists")
  }

  const user = await User.create({
    name,
    email,
    password
  })
console.log({user})
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email:user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      walletKey: user.walletKey,
      token: generateToken(user._id)
    })
  } else {
    res.status(400)
    throw new Error("Error Occurred !")
  }


}) 




const authUser = asyncHandler(async (req, res) => {
  const {  email, password } = req.body;

  const user = await User.findOne({ email});
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email:user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id)
    })
  } else {
    res.status(400)
    throw new Error("Invalid email or password !")
  }


})


const updateUser = asyncHandler(async (req, res) => {
  const { email,key} = req.body;

  const user = await User.findOne({ email });
    if (!user) {
    res.status(400)
    throw new Error("User does not exists")
  }

  const user1 = await User.updateOne({ _id: user._id }, { $set: {  walletKey:  key } })
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email:user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      walletKey: key,
      token: generateToken(user._id)
    })
  }


})

module.exports = {registerUser,authUser,updateUser}