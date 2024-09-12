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

const { dialog } = require('electron')
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
const saveFile2Local = (messageId, filePath, fileType) => {
  return new Promise(async (resolve, reject) => {
    try {
      let ffmpegPath = getFFmpegPath()
      let ffprobePath = getFFprobePath()
      let savePath = await getLocalFilePath('chat', false, messageId)
      fs.copyFileSync(filePath, savePath)
      let coverPath = null
      if (fileType == 1) {
        // 获取视频编码格式
        let command = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
        let result = await execCommand(command)
        result = result.replace(/\r\n/g, '')
        result = result.substring(result.indexOf('=') + 1)
        let codec = result.substring(0, result.indexOf('['))
        //     console.log('获取的视频编码格式为', codec)

        // 转换视频编码格式
        if (codec === 'hevc') {
          command = `${ffmpegPath} -y -i "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
          await execCommand(command)
        }

        // 生成缩略图
        coverPath = savePath + '_cover.png'
        command = `${ffmpegPath} -i "${savePath}" -y -vframes 1 -ss 00:00:05 -vf "scale=min(170\\, iw*min(170/iw\\, 170/ih)):min(170\\, ih*min(170/iw\\, 170/ih))" "${coverPath}"`

        await execCommand(command)
      }

      uploadFile(messageId, savePath, coverPath)
      resolve()
    } catch (error) {
      console.error('保存文件到本地时出错:', error)
      reject(error)
    }
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
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      token: token
    }
  }
  axios
    .post(url, formData, config)
    .then((res) => {
      console.log('上传文件成功:')
    })
    .catch((error) => {
      console.error('上传文件失败:', error)
    })
}

//获取资源路径
const getResourcesPath = () => {
  let resourcesPath = app.getAppPath()
  if (process.env.NODE_ENV !== 'development') {
    resourcesPath = path.join(path.dirname(app.getPath('exe')), 'resources')
  }
  return resourcesPath
}

//获取ffprobe路径
const getFFprobePath = () => {
  return path.join(getResourcesPath(), ffprobePath)
}

//获取ffmpeg路径
const getFFmpegPath = () => {
  return path.join(getResourcesPath(), ffmpegPath)
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
      localFolder = localFolder + '\\' + month

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
      responseType: 'stream', // 设置响应类型为流
      headers: {
        'content-type': 'multipart/form-data', // 设置请求头的内容类型
        token: token // 设置请求头的 token
      }
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

export { saveFile2Local, getLocalFilePath, downloadFile }
