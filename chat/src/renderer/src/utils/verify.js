// 定义一些常用的正则表达式
const regs = {
  // 邮箱正则表达式
  email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  // 数字正则表达式，匹配正整数
  number: /^\+?[1-9][0-9]*$/,
  // 密码正则表达式，长度至少为2，最多为10，可以包含特殊字符
  password: /^[\w~!@#$%^&*_]{2,10}$/,
  // 版本号正则表达式，匹配由数字和点组成的字符串
  version: /^[0-9\.]+$/
}

// 验证函数，根据提供的规则、值和正则表达式进行验证
const verify = (rule, value, reg, callback) => {
  if (value) {
    // 如果值存在
    if (reg.test(value)) {
      // 如果值匹配正则表达式
      callback() // 调用回调函数，不传入任何参数，表示验证通过
    } else {
      // 如果值不匹配正则表达式
      callback(new Error(rule.message)) // 调用回调函数，传入一个错误对象，表示验证失败
    }
  } else {
    // 如果值不存在
    callback() // 调用回调函数，不传入任何参数，表示验证通过
  }
}

// 验证邮箱的函数
const checkEmail = (value) => {
  return regs.email.test(value) // 使用邮箱的正则表达式进行验证
}

// 验证密码的函数
const checkPassword = (value) => {
  return regs.password.test(value) // 使用密码的正则表达式进行验证
}

// 验证密码的函数，使用回调形式
const password = (rule, value, callback) => {
  return verify(rule, value, regs.password, callback) // 使用密码的正则表达式进行验证
}

// 验证数字的函数，使用回调形式
const number = (rule, value, callback) => {
  return verify(rule, value, regs.number, callback) // 使用数字的正则表达式进行验证
}

// 验证版本号的函数，使用回调形式
const version = (rule, value, callback) => {
  return verify(rule, value, regs.version, callback) // 使用版本号的正则表达式进行验证
}

// 导出所有的验证函数
export default {
  checkEmail,
  checkPassword,
  password,
  number,
  version
}
