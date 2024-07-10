var express = require("express");
var router = express.Router();
var userRouter = require("./userRouter");
var authRouter = require("./authRouter");
router.use(userRouter);
router.use(authRouter);
module.exports = router;
