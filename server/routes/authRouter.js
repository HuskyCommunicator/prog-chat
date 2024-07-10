// 引入所需的模块
const express = require("express");
const authController = require("../controller/authController");
// 创建路由器
const authRouter = express.Router();
//注册
authRouter.post("/reg", authController.register);
//登录
authRouter.post("/login", authController.login);
module.exports = authRouter;
