const ctrlWrapper = require("../helpers/ctrlWrapper");
const HttpError = require("../helpers/HttpError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
require("dotenv").config();
var Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");

const { SECRET_KEY } = process.env;

const { User } = require("../models/user");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { password, email } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  const avatarURL = gravatar.url(email);
  console.log(avatarURL);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email, // Change to your recipient
    from: "katrinkir1296@gmail.com", // Change to your verified sender
    subject: "Verification email",
    text: `Please verify your email http://localhost:3000/api/users/verify/${verificationToken}`,
    html: ` Please, <a href='http://localhost:3000/api/users/verify/${verificationToken}'> confirm</a> your email`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, verify: true });
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

const getVerification = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.find({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true }
  );
  res.json({ message: "Verification successful" });
};

const getRepeatedVerifying = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw HttpError(400, "missing required field email");
  }
  const user = await User.findOne({ email, verify: false });
  if (!user) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verificationToken = user.verificationToken;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email, // Change to your recipient
    from: "katrinkir1296@gmail.com", // Change to your verified sender
    subject: "Verification email",
    text: `Please verify your email http://localhost:3000/api/users/verify/${verificationToken}`,
    html: ` Please, <a href='http://localhost:3000/api/users/verify/${verificationToken}'> confirm</a> your email`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

  res.json({
    message: "Verification email sent",
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  getVerification: ctrlWrapper(getVerification),
  getRepeatedVerifying: ctrlWrapper(getRepeatedVerifying),
};
