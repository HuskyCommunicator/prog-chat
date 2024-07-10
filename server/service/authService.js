var userModel = require("../model/userModel");
const authService = {
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
  getUserById: async (id) => {
    return userModel.findById(id);
  },
  //根据email获取用户信息
  getUserByEmail: async (email) => {
    return userModel.findOne({ email });
  },
  //更新用户信息
  updateUser: async (id, updateData) => {
    return userModel.findByIdAndUpdate(id, updateData);
  },
  //删除用户
  deleteUser: async (id) => {
    return userModel.findByIdAndDelete(id);
  },
};
module.exports = authService;
