const jwt = require("jsonwebtoken");
const app = require("../app");
const request = require("supertest");
const { User } = require("../models/user");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const { DB_HOST } = process.env;

mongoose.set("strictQuery", true);

describe("test login controller", () => {
  let server;
  let testUser;

  const user = {
    email: "test@gmail.com",
    password: "test123",
    subscription: "starter",
  };

  beforeAll(async () => {
    mongoose
      .connect(DB_HOST)
      .then(() => {
        server = app.listen(3000);
      })
      .catch((error) => {
        console.log(error.message);
        process.exit(1);
      });

    testUser = await request(app).post("/api/users/register").send(user);
  });

  afterAll(async () => {
    await User.findOneAndDelete(user.email);
    await mongoose.disconnect();
    server.close();
  });
  test("should return status code 200", async () => {
    await request(app)
      .post("/api/users/login")
      .send({ email: user.email, password: user.password })
      .expect(200);
  });

  test("should return token", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: user.email, password: user.password });

    expect(response.body.token).toBeDefined();
  });
  test("should return user", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: user.email, password: user.password });

    expect(response.body.user).toMatchObject(
      expect.objectContaining({
        email: expect.any(String),
        subscription: expect.any(String),
      })
    );
  });
});

// expect(response.body.data.user).toBeDefined();
// expect(response.body.data.user.email).toBeDefined();
// expect(response.body.data.user.password).toBeDefined();
// expect(typeof response.body.data.user.email).toBe("string");
// expect(typeof response.body.data.user.password).toBe("string");
