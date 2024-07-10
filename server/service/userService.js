var userModel = require("../model/userModel");
const userService = {
  //获取用户列表
  getUserList: async () => {
    return userModel.find();
  },
  //注册
  register: async ({ email, nickName, password }) => {
    return userModel.create({ email, nickName, password });
  },
  //登录
  login: async ({ email, password }) => {
    return userModel.findOne({ email, password });
  },
  //根据id获取用户信息
  findById: async (id) => {
    return userModel.findById({ _id: id });
  },
  //根据email获取用户信息
  getUserByEmail: async (email) => {
    return userModel.findOne({ email });
  },
  //更新用户信息
  updateUser: async ({ id, email, nickName, password }) => {
    return userModel.updateOne({ _id: id }, { email, nickName, password });
  },
  //删除用户
  deleteUser: async (id) => {
    return userModel.deleteOne({ _id: id });
  },
};
module.exports = userService;
