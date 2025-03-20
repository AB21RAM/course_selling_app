const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const adminMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.ADMIN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({
          message: "invalid token",
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  } else {
    res.status(401).send({
      message: "Unautherized",
    });
  }
};
module.exports = {
  adminMiddleware,
};
