const express = require("express");
const adminRouter = express.Router();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { adminModel, courseModel } = require("../db");
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const cookieParser = require("cookie-parser");
adminRouter.use(cookieParser());

adminRouter.post("/signup", async (req, res) => {
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
    await adminModel.create({
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

adminRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({
      email: email,
    });

    const passwordMatch = bcrypt.compare(password, admin.password);

    if (admin && passwordMatch) {
      const token = jwt.sign(
        {
          id: admin._id.toString(),
        },
        process.env.ADMIN_SECRET
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

adminRouter.post("/course", adminMiddleware, async (req, res) => {
  console.log("Request Body:", req.body);

  const adminId = req.userId;

  const { title, description, price, imageUrl } = req.body;

  const course = await courseModel.create({
    title: title,
    description: description,
    imageUrl: imageUrl,
    price: price,
    creatorId: adminId,
  });

  console.log("Created Course:", course);
  res.json({
    message: "Course created",
    courseId: course._id,
  });
});

adminRouter.put("/course", adminMiddleware, async (req, res) => {
  const adminId = req.userId;
  const { title, description, imageUrl, price, courseId } = req.body;
  const course = await courseModel.updateOne(
    {
      _id: courseId,
      creatorId: adminId,
    },
    {
      title: title,
      description: description,
      imageUrl: imageUrl,
      price: price,
    }
  );
  res.json({
    message: "Course updated",
    courseId: course._id,
  });
});

adminRouter.get("/course/bulk", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });

  res.json({
    courses,
  });
});

module.exports = {
  adminRouter: adminRouter,
};
