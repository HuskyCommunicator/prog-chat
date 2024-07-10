// 引入所需的模块
const userService = require("../service/userService"); // 用户服务模块，提供用户相关的数据库操作
const authService = require("../service/authService"); // 认证服务模块，提供注册和登录等认证相关的功能
const sendResponse = require("../utils/sendResponse"); // 响应发送工具函数，用于统一处理HTTP响应

// 定义认证控制器
const authController = {
  // 注册功能
  register: async (req, res) => {
    // 从请求体中获取邮箱、昵称和密码
    const { email, nickName, password } = req.body;

    // 通过邮箱获取用户
    const user = await userService.getUserByEmail(email);

    // 如果用户已存在，则返回错误信息
    if (user) {
      return sendResponse(res, 400, "注册失败,该邮箱已存在");
    }

    // 注册新用户
    let result = await authService.register({ email, nickName, password });

    // 返回成功信息和注册结果
    return sendResponse(res, 201, "注册成功", result);
  },

  // 登录功能
  login: async (req, res) => {
    // 从请求体中获取邮箱和密码
    const { email, password } = req.body;

    // 登录
    let result = await authService.login({ email, password });

    // 如果邮箱和密码不匹配，则返回错误信息
    if (!result) {
      return sendResponse(res, 400, "邮箱密码不匹配");
    }

    // 返回成功信息
    return sendResponse(res, 200, "登录成功");
  },
};

// 导出认证控制器模块
module.exports = authController;
