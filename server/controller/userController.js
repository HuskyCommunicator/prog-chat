// 引入所需的模块
const userService = require("../service/userService"); // 用户服务模块，提供用户相关的数据库操作
const sendResponse = require("../utils/sendResponse"); // 响应发送工具函数，用于统一处理HTTP响应

// 定义用户控制器
const userController = {
  // 获取用户列表
  getUserList: async (req, res) => {
    // 调用userService的getUserList方法获取用户列表
    let result = await userService.getUserList();
    //发送HTTP响应
    return sendResponse(res, 200, "获取用户列表成功", result);
  },
  // 获取用户信息
  getUser: async (req, res) => {
    // 从请求参数中获取用户ID
    const id = req.params.id;
    // 调用userService的getUserInfo方法获取用户信息
    let result = await userService.getUserInfo(id);
    //发送HTTP响应
    return sendResponse(res, 200, "获取用户信息成功", result);
  },
  //修改用户
  updateUser: async (req, res) => {
    // 从请求参数中获取用户ID
    const id = req.params.id;
    const { email, nickName, password } = req.body;
    // 调用userService的getUserInfo方法获取用户信息
    let user = await userService.findById(id);
    if (!user) {
      return sendResponse(res, 400, "修改失败,该用户不存在");
    }
    let result = await userService.updateUser({
      id,
      email,
      nickName,
      password,
    });
    result = {
      id,
      email,
      nickName,
      password,
    };
    return sendResponse(res, 200, "修改用户信息成功", result);
  },
  //删除用户
  deleteUser: async (req, res) => {
    // 从请求参数中获取用户ID
    const id = req.params.id;
    // 调用userService的getUserInfo方法获取用户信息
    let user = await userService.findById(id);
    if (!user) {
      return sendResponse(res, 400, "删除失败,该用户不存在");
    }
    const result = await userService.deleteUser(id);
    return sendResponse(res, 200, "删除用户成功");
  },
};

// 导出用户控制器模块
module.exports = userController;
