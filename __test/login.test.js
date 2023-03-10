const { login } = require("../controllers/auth");
const { SECRET_KEY } = process.env;
const jwt = require("jsonwebtoken");
const app = require("../app");
const request = require("supertest");
const User = require("../models/user");
const bcrypt = require("bcrypt");

jest.mock("../models/user");

describe("test login controller", () => {
  test("should return status code 200", async () => {
    // Arrange
    const req = {
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn(),
    };
    const user = {
      id: "testuserid",
      email: "test@test.com",
      password: await bcrypt.hash("testpassword", 10),
      subscription: "free",
    };

    const passwordCompare = await bcrypt.compare(
      req.body.password,
      user.password
    );

    const token = jwt.sign({ id: user.id }, SECRET_KEY);

    const response = await request(app)
      .post("api/users/login")
      .send({ email: req.body.email, password: req.body.password })
      .expect(200);

    expect(response.body).toHaveProperty("token");

    // Act
    // login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
  });

  //   test("should return status code 200", async () => {
  //     const req = {
  //       body: {
  //         email: "test@test.com",
  //         password: "testpassword",
  //       },
  //     };
  //     const res = {
  //       json: jest.fn(),
  //       status: jest.fn().mockReturnThis(),
  //     };
  //     const user = {
  //       _id: "testuserid",
  //       email: "test@test.com",
  //       password: await bcrypt.hash("testpassword", 10),
  //       subscription: "free",
  //     };

  //     // Act
  //     login(req, res);

  //     // Assert
  //     expect(res.status).toEqual(200);
  //   });

  //   it("should return status code 200", async () => {
  //     const user = {
  //       id: "1",
  //       email: "test1@gmail.com",
  //       subscription: "starter",
  //       password: "123456",
  //     };
  //     const req = {
  //       body: {
  //         email: "test1@gmail.com",
  //         password: "123456",
  //       },
  //     };
  //     const res = {
  //       json: jest.fn(),
  //       status: jest.fn().mockReturnThis(),
  //     };

  //     login(req, res);

  //     expect(res.status).toHaveBeenCalledWith(200);
  //   });

  //   it("res.satus must be 200", async () => {
  //     // const mReq = {
  //     //   body: {
  //     //     email: "test1@gmail.com",
  //     //     password: "123456",
  //     //   },
  //     // };

  //     const mockRequest = (data) => {
  //       return {
  //         body: { ...data },
  //       };
  //     };

  //     const mockResponse = () => {
  //       const res = {};
  //       res.status = jest.fn().mockReturnValue(res);
  //       res.json = jest.fn().mockReturnValue(res);
  //       return res;
  //     };

  //     const mReq = mockRequest({
  //       email: "test1@gmail.com",
  //       password: "123456",
  //     });
  //     const mRes = mockResponse();
  //     const mNext = jest.fn();

  //     const user = {
  //       id: "1",
  //       email: "test1@gmail.com",
  //       subscription: "starter",
  //       password: "123456",
  //     };

  //     const passwordCompare = mReq.body.password === user.password;

  //     const token = jwt.sign({ id: user.id }, SECRET_KEY);
  //     login(mReq, mRes);
  //     expect(mRes.status).toHaveBeenCalledWith(200);
  //     expect(mRes.json).toHaveBeenCalledWith({
  //       token,
  //       user: {
  //         email: user.email,
  //         subscription: user.subscription,
  //       },
  //     });

  //     // expect(await login(mReq, mRes)).toBeCalledWith(mReq, mRes);
  //     // expect(mRes.status(200)).toEqual(200);

  //     // expect(login(mReq, mRes)).toEqual({ один: 1, два: 2 });
  //   });

  //   it("", () => {
  //     const user = {
  //       id: "1",
  //       email: "test1@gmail.com",
  //       subscription: "starter",
  //     };
  //     const token = jwt.sign({ id: user.id }, SECRET_KEY);

  //     const mReq = {
  //       body: {
  //         email: "test1@gmail.com",
  //         password: "123456",
  //       },
  //     };

  //     const mRes = {
  //       status: 200,
  //       json: (data) => {
  //         return {};
  //       },
  //     };
  //   });
});
