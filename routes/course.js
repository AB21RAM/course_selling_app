const express = require("express");
const courseRouter = express.Router();
const { userMiddleware } = require("../middlewares/userMiddleware");
const { purchaseModel, courseModel } = require("../db");
const cookieParser = require("cookie-parser");
courseRouter.use(cookieParser());

courseRouter.post("/purchase", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  await purchaseModel.create({
    userId,
    courseId,
  });
  res.json({
    message: "You have successfully bought the course",
  });
});
courseRouter.get("/preview", userMiddleware, async (req, res) => {
  const courses = await courseModel.find({});

  res.json({
    courses,
  });
});
// courseRouter.get("/courses", (req, res) => {});

module.exports = {
  courseRouter: courseRouter,
};
