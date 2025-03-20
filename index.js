const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");

app.use(express.json());
// injecting the router as middleware
app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

async function main() {
  await mongoose.connect(process.env.DB_URL);
  app.listen(3000, () => {
    console.log("App is Running");
  });
}

main();
