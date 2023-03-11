const { model, Schema } = require("mongoose");
const Joi = require("joi");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: emailRegexp,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    avatarURL: {
      type: String,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: String,
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", (error, data, next) => {
  const { name, code } = error;
  const status = name === "MongoServerError" && code === 11000 ? 409 : 400;
  const message =
    name === "MongoServerError" && code === 11000
      ? "Email in use"
      : error.message;
  error.status = status;
  error.message = message;
  next();
});

const registerSchema = Joi.object({
  subscription: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
});

const schemas = {
  registerSchema,
  loginSchema,
};

const User = model("user", userSchema);

module.exports = { User, schemas };
