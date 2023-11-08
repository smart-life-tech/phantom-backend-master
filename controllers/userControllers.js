const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generateToken, checkToken } = require("../utils/generateToken");
const Order = require("../models/orderModel");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, secretKey, pic } = req.body;

  console.log({ name, email, secretKey, password });
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User exists");
  }
  let isAdmin = false;
  if (secretKey && secretKey === process.env.JWT_SECRETE) {
    isAdmin = true;
  }
  const user = await User.create({
    name,
    email,
    password,
    isAdmin,
  });
  console.log({ user });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      walletKey: user.walletKey,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Error Occurred !");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });
  const user = await User.findOne({ email });
  console.log({ user });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password !");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { email, key } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exists");
  }

  const user1 = await User.updateOne(
    { _id: user._id },
    { $set: { walletKey: key } }
  );
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      walletKey: key,
      token: generateToken(user._id),
    });
  }
});

const submitOrderNumber = asyncHandler(async (req, res) => {
  const { orderNumber, orderEmail, orderPlatform, userId } = req.body;
  const orderExists = await Order.findOne({ orderEmail });

  if (orderExists) {
    res.status(400);
    throw new Error("order exists");
  }
  const order = await Order.create({
    orderNumber,
    orderEmail,
    orderPlatform,
    userId,
  });
  if (order) {
    res.status(201).json({
      _id: order._id,
      orderNumber: order.orderNumber,
      orderPlatform: order.orderPlatform,
      orderEmail: order.orderEmail,
    });
  } else {
    res.status(400);
    throw new Error("Error Occurred !");
  }
});

const getAllUserOrders = asyncHandler(async (req, res) => {
  try {
    const user = checkToken(req.headers.authorization.split(" ")[1]);
    if (user) {
      const orders = await Order.find({ userId: user.id });
      if (orders) {
        res.status(200).json(orders);
      }
    } else {
      console.log("wrong JWT");
    }
  } catch (e) {
    console.log({ e });
  }
});
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const user = checkToken(req.headers.authorization.split(" ")[1]);
    if (user) {
      const orders = await Order.find();
      if (orders) {
        res.status(200).json(orders);
      }
    } else {
      console.log("wrong JWT");
    }
  } catch (e) {
    console.log({ e });
  }
});

module.exports = {
  registerUser,
  authUser,
  updateUser,
  submitOrderNumber,
  getAllOrders,
  getAllUserOrders,
};
