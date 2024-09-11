const fs = require('fs')
const path = require('path')

const mkdirs = (dir) => {
  // 检查目录是否存在
  if (!fs.existsSync(dir)) {
    // 获取上一级目录的路径
    const parentDir = path.dirname(dir)
    // 如果上一级目录与当前目录不同，递归创建上一级目录
    if (parentDir !== dir) {
      mkdirs(parentDir)
    }
    // 创建当前目录
    fs.mkdirSync(dir)
  }
}

// 示例用法
mkdirs('c:/111/222/333')
