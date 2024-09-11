const fs = require('fs')
const fse = require('fs-extra')
const NODE_ENV = process.env.NODE_ENV
const path = require('path')
const { app, ipcMain, shell } = require('electron')
const { exec } = require('child_process')
const FormData = require('form-data') // 引入FormData模块（用于构建表单数据）
const axios = require('axios') // 引入axios库
import store from './store'
import { selectByMessageId } from './db/ChatMessageModel'
const moment = require('moment')
moment.locale('zh-cn', {})
const { dialog } = require('electron')

const saveFile2Local = (messageId, filePath, fileType) => {
  return new Promise(async (resolve, reject) => {
    let savePath = await getLocalFilePath('chat', false, messageId)
    fs.copyFileSync(filePath, savePath)
    resolve()
  })
}

//递归创建目录
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

const getLocalFilePath = (partType, showCover, fileId) => {
  return new Promise(async (resolve, reject) => {
    // 获取本地文件夹路径
    let localFolder = store.getUserData('localFileFolder')
    // 初始化本地路径变量
    let localPath = null

    // 根据partType判断处理逻辑
    if (partType == 'avatar') {
      // 如果partType是'avatar'，这里可以添加处理逻辑
    } else if (partType == 'chat') {
      // 如果partType是'chat'，获取消息信息
      let messageInfo = await selectByMessageId(fileId)
      // 将发送时间转换为YYYYMM格式的月份
      const month = moment(Number.parseInt(messageInfo.sendTime)).format('YYYYMM')
      // 更新本地文件夹路径，添加月份子文件夹
      localFolder = localFolder + '/' + month

      // 如果本地文件夹不存在，则创建它
      if (!fs.existsSync(localFolder)) {
        mkdirs(localFolder)
      }

      // 获取文件后缀名
      let fileSuffix = messageInfo.fileName
      fileSuffix = fileSuffix.substring(fileSuffix.lastIndexOf('.'))

      // 生成本地文件路径
      localPath = localFolder + '/' + fileId + fileSuffix
    }

    // 解析本地路径
    resolve(localPath)
  })
}

export { saveFile2Local }
