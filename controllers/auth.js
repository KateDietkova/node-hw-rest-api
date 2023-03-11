const ctrlWrapper = require("../helpers/ctrlWrapper");
const HttpError = require("../helpers/HttpError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
require("dotenv").config();
var Jimp = require("jimp");

const { SECRET_KEY } = process.env;

const { User } = require("../models/user");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { password, email } = req.body;

  const hashPassword = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email);
  console.log(avatarURL);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  const subscriptionList = ["starter", "pro", "business"];
  if (!subscriptionList.includes(subscription)) {
    throw HttpError(400, "This subscription type doesn't exist");
  }
  const user = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.json({
    email: user.email,
    subscription: user.subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const { _id: userId } = req.user;
  const filename = `${userId}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);

  Jimp.read(resultUpload, (err, avatar) => {
    if (err) throw err;
      avatar.resize(250, 250).write(resultUpload);
  });
  await User.findByIdAndUpdate(userId, { avatarURL });

  res.json({ avatarURL });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
