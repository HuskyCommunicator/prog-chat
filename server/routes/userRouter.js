// 引入所需的模块
const express = require("express");
const userController = require("../controller/userController");

// 创建路由器
const userRouter = express.Router();
//获取用户列表
userRouter.get("/user", userController.getUserList);
//获取用户信息
userRouter.get("/user/:id", userController.getUser);
//修改用户信息
userRouter.put("/user/:id", userController.updateUser);
//删除用户
userRouter.delete("/user/:id", userController.deleteUser);
module.exports = userRouter;
