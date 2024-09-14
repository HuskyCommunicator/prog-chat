const fs = require('fs')
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

//获取域名
const getDomain = () => {
  return NODE_ENV !== 'development' ? store.getData('prodDomain') : store.getData('devDomain')
}

//缩略图后缀
const cover_image_suffix = '_cover.png'
const image_suffix = '.png'

const ffprobePath = '/assets/ffprobe.exe'
const ffmpegPath = '/assets/ffmpeg.exe'

const getResourcesPath = () => {
  let resourcesPath = app.getAppPath()
  if (NODE_ENV !== 'development') {
    resourcesPath = path.dirname(app.getPath('exe')) + '/resources/'
  }
  return resourcesPath
}

const getFFprobePath = () => {
  return path.join(getResourcesPath(), ffprobePath)
}

const getFFmegPath = () => {
  return path.join(getResourcesPath(), ffmpegPath)
}

//控制台执行
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      //  console.log('ffmpeg命令:', command)
      if (error) {
        console.error('ffmpeg命令执行失败:', error)
      }
      resolve(stdout)
    })
  })
}

//保存文件到本地
const saveFile2Local = async (messageId, filePath, fileType) => {
  return new Promise(async (resolve, reject) => {
    let ffmpegPath = getFFmegPath()
    let savePath = await getLocalFilePath('chat', false, messageId)
    let coverPath = null
    fs.copyFileSync(filePath, savePath)
    //生成缩略图
    if (fileType != 2) {
      //判断视频格式
      let command = `${getFFprobePath()} -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
      let result = await execCommand(command)
      result = result.replaceAll('\r\n', '')
      result = result.substring(result.indexOf('=') + 1)
      let codec = result.substring(0, result.indexOf('['))
      if ('hevc' === codec) {
        command = `${ffmpegPath}  -y -i "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
        await execCommand(command)
      }
      //生成缩略图
      coverPath = savePath + cover_image_suffix
      // console.log('savePath:', savePath)
      // console.log('coverPath', coverPath)

      command = `${ffmpegPath} -i "${savePath}" -y -vframes 1 -vf "scale=min(170\\,iw*min(170/iw\\,170/ih)):min(170\\,ih*min(170/iw\\,170/ih))" "${coverPath}"`
      await execCommand(command)
    }
    //上传文件
    uploadFile(messageId, savePath, coverPath)
    resolve()
  })
}
//上传文件到服务器
const uploadFile = (messageId, savePath, coverPath) => {
  const formData = new FormData()
  formData.append('messageId', messageId)
  formData.append('file', fs.createReadStream(savePath))
  if (coverPath) {
    formData.append('cover', fs.createReadStream(coverPath))
  }
  const url = `${getDomain()}/api/chat/uploadFile`
  const token = store.getUserData('token')
  const config = { headers: { 'Content-Type': 'multipart/form-data', token: token } }

  axios
    .post(url, formData, config)
    .then((response) => {})
    .catch((error) => {
      console.error('文件上传失败', error)
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

const getLocalFilePath = async (partType, showCover, fileId) => {
  return new Promise(async (resolve, reject) => {
    // 获取本地文件夹路径
    let localFolder = store.getUserData('localFileFolder')
    // 初始化本地路径变量
    let localPath = null

    // 根据partType判断处理逻辑
    if (partType == 'avatar') {
      // 如果partType是'avatar'，获取头像路径
      localFolder = localFolder + '/avatar/'
      if (!fs.existsSync(localFolder)) {
        mkdirs(localFolder)
      }
      localPath = localFolder + fileId + image_suffix
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

      //  获取文件后缀名
      let fileSuffix = messageInfo.fileName
      fileSuffix = fileSuffix.substring(fileSuffix.lastIndexOf('.'))
      if (fileSuffix === '.hevc') {
        fileSuffix = '.mp4'
      }
      // 生成本地文件路径
      localPath = localFolder + '\\' + fileId + fileSuffix
    }
    if (showCover) {
      localPath = localPath + cover_image_suffix
    }
    // 解析本地路径
    resolve(localPath)
  })
}

//下载头像
const downloadFile = (fileId, showCover, savePath, partType) => {
  // 将 showCover 转换为字符串
  showCover = showCover + ''
  // 定义下载文件的 URL
  let url = `${getDomain()}/api/chat/downloadFile`
  // 获取用户的 token
  const token = store.getUserData('token')
  // 返回一个新的 Promise 对象
  return new Promise(async (resolve, reject) => {
    // 配置请求的参数
    const config = {
      responseType: 'stream',
      headers: { 'Content-Type': 'multipart/form-data', token: token }
    }
    // 发送 POST 请求以下载文件
    let response = await axios.post(
      url,
      {
        fileId, // 文件 ID
        showCover // 是否显示封面
      },
      config // 请求配置
    )
    // 获取保存路径的文件夹路径
    const folder = savePath.substring(0, savePath.lastIndexOf('/'))
    // 创建文件夹
    mkdirs(folder)
    // 创建写入流
    const stream = fs.createWriteStream(savePath)
    // 如果响应的内容类型是 JSON
    if (response.headers['content-type'] === 'application/json') {
      // 获取资源路径
      let resourcesPath = getResourcesPath()
      // 如果 partType 是 'avatar'
      if (partType == 'avatar') {
        // 读取默认用户头像并写入流
        fs.createReadStream(resourcesPath + '/assets/user.png').pipe(stream)
      } else {
        // 读取 404 图片并写入流
        fs.createReadStream(resourcesPath + '/assets/404.png').pipe(stream)
      }
    } else {
      // 将响应数据写入流
      response.data.pipe(stream)
    }
    // 当写入完成时
    stream.on('finish', () => {
      // 关闭流
      stream.close()
      // 解析 Promise
      resolve()
    })
  })
}

//创建封面
const createCover = (filePath) => {
  return new Promise(async (resolve, reject) => {
    let ffmpegPath = getFFmegPath()
    let avatarPath = await getLocalFilePath('avatar', false, store.getUserId() + '_temp')
    let command = `${ffmpegPath} -i "${filePath}" "${avatarPath}" -y`
    await execCommand(command)

    let coverPath = await getLocalFilePath('avatar', false, store.getUserId() + '_temp_cover')
    command = `${ffmpegPath} -i "${filePath}" -y -vframes 1 -vf "scale=min(60\\,iw*min(60/iw\\,60/ih)):min(60\\,ih*min(60/iw\\,60/ih))" "${coverPath}"`
    await execCommand(command)

    resolve({
      avatarStream: fs.readFileSync(avatarPath),
      coverStream: fs.readFileSync(coverPath)
    })
  })
}

export { saveFile2Local, getLocalFilePath, downloadFile, createCover }
