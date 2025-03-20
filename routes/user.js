const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { userMiddleware } = require("../middlewares/userMiddleware");
const { userModel, purchaseModel, courseModel } = require("../db");
userRouter.use(cookieParser());

userRouter.post("/signup", async (req, res) => {
  const requireBody = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string().min(3).max(30),
    firstName: z.string(),
    lastName: z.string(),
  });

  const parsedDataWithSuccess = requireBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    res.json({
      message: "Incorrect Input",
      error: parsedDataWithSuccess.error,
    });
    return;
  }

  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
    res.json({
      message: "You are SignUp Succesfully",
    });
  } catch (err) {
    res.status(403).json({
      message: err.message,
    });
    return;
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email: email,
    });

    const passwordMatch = bcrypt.compare(password, user.password);

    if (user && passwordMatch) {
      const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        process.env.USER_SECRET
      );
      // cookie Logic
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
      });

      res.json({
        token: token,
      });
    } else {
      res.status(403).json({
        message: "Incorrect Credential",
      });
    }
  } catch (err) {
    console.log(" ERROR : " + err.message);
    res.status(401).json({
      message: "Server Error",
    });
  }
});

userRouter.get("/purchases", userMiddleware, async function (req, res) {
  const userId = req.userId;

  const purchases = await purchaseModel.find({
    userId,
  });

  // let purchasedCourseIds = []; .

  // for (let i = 0; i < purchases.length; i++) {
  //   purchasedCourseIds.push(purchases[i].courseId);
  // }

  const coursesData = await courseModel.find({
    _id: {
      $in: purchases.map((x) => x.courseId),
    },
  });

  res.json({
    purchases,
    coursesData,
  });
});

module.exports = {
  userRouter: userRouter,
};
