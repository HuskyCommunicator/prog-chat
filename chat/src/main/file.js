const fs = require('fs')
const fse = require('fs-extra')
const NODE_ENV = process.env.NODE_ENV
const path = require('path')
const { app, ipcMain, shell } = require('electron')
const { exec } = require('child_process')
const FormData = require('form-data') // 引入FormData模块（用于构建表单数据）
const axios = require('axios') // 引入axios库
import store from './store'
const moment = require('moment')
moment.locale('zh-cn', {})
const { dialog } = require('electron')

const saveFile2Local = (messageId, filePath, fileType) => {
  return new Promise((resolve, reject) => {
    resolve()
  })
}

export { saveFile2Local }
