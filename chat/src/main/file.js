// 引入文件系统模块
const fs = require('fs')

// 获取环境变量NODE_ENV
const NODE_ENV = process.env.NODE_ENV

// 引入路径模块
const path = require('path')

// 从electron模块中引入app, ipcMain, shell
const { app, ipcMain, shell } = require('electron')

// 引入子进程模块
const { exec } = require('child_process')

// 引入FormData模块
const FormData = require('form-data')

// 引入axios模块
const axios = require('axios')

//引入dialog模块
const { dialog } = require('electron')

// 从store模块中引入store
import store from './store'

// 从ChatMessageModel模块中引入selectByMessageId
import { selectByMessageId } from './db/ChatMessageModel'

// 引入moment模块并设置语言为中文
const moment = require('moment')
moment.locale('zh-cn', {})

// 获取域名，根据环境变量NODE_ENV判断是生产环境还是开发环境
const getDomain = () => {
  return NODE_ENV !== 'development' ? store.getData('prodDomain') : store.getData('devDomain')
}

// 定义封面图片后缀
const cover_image_suffix = '_cover.png'

// 定义图片后缀
const image_suffix = '.png'

// 定义ffprobe的路径
const ffprobePath = '/assets/ffprobe.exe'

// 定义ffmpeg的路径
const ffmpegPath = '/assets/ffmpeg.exe'

// 获取资源路径，根据环境变量NODE_ENV判断是生产环境还是开发环境
const getResourcesPath = () => {
  let resourcesPath = app.getAppPath()
  if (NODE_ENV !== 'development') {
    resourcesPath = path.dirname(app.getPath('exe')) + '/resources/'
  }
  return resourcesPath
}

// 获取ffprobe的完整路径
const getFFprobePath = () => {
  return path.join(getResourcesPath(), ffprobePath)
}

// 获取ffmpeg的完整路径
const getFFmegPath = () => {
  return path.join(getResourcesPath(), ffmpegPath)
}

// 执行命令行命令，返回Promise对象
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('ffmpeg命令执行失败:', error)
      }
      resolve(stdout)
    })
  })
}

// 将文件保存到本地
const saveFile2Local = async (messageId, filePath, fileType) => {
  return new Promise(async (resolve, reject) => {
    // 获取ffmpeg的路径
    let ffmpegPath = getFFmegPath()
    // 获取本地文件路径
    let savePath = await getLocalFilePath('chat', false, messageId)
    let coverPath = null
    // 将文件复制到本地路径
    fs.copyFileSync(filePath, savePath)
    if (fileType != 2) {
      // 获取视频编码格式
      let command = `${getFFprobePath()} -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
      let result = await execCommand(command)
      result = result.replaceAll('\r\n', '')
      result = result.substring(result.indexOf('=') + 1)
      let codec = result.substring(0, result.indexOf('['))
      if ('hevc' === codec) {
        // 如果视频编码格式为hevc，则转换为libx264格式
        command = `${ffmpegPath}  -y -i "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
        await execCommand(command)
      }
      // 生成视频封面
      coverPath = savePath + cover_image_suffix
      command = `${ffmpegPath} -i "${savePath}" -y -vframes 1 -vf "scale=min(170\\,iw*min(170/iw\\,170/ih)):min(170\\,ih*min(170/iw\\,170/ih))" "${coverPath}"`
      await execCommand(command)
    }
    // 上传文件
    uploadFile(messageId, savePath, coverPath)
    resolve()
  })
}
// 上传文件到服务器
const uploadFile = (messageId, savePath, coverPath) => {
  // 创建FormData对象
  const formData = new FormData()
  // 添加messageId到FormData
  formData.append('messageId', messageId)
  // 添加文件到FormData
  formData.append('file', fs.createReadStream(savePath))
  // 如果有封面路径，添加封面到FormData
  if (coverPath) {
    formData.append('cover', fs.createReadStream(coverPath))
  }
  // 获取上传文件的URL
  const url = `${getDomain()}/api/chat/uploadFile`
  // 获取用户的token
  const token = store.getUserData('token')
  // 配置请求头
  const config = { headers: { 'Content-Type': 'multipart/form-data', token: token } }

  // 发送POST请求上传文件
  axios
    .post(url, formData, config)
    .then((response) => {})
    .catch((error) => {
      console.error('文件上传失败', error)
    })
}

// 递归创建目录
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

// 获取本地文件路径
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

      // 获取文件后缀名
      let fileSuffix = messageInfo.fileName
      fileSuffix = fileSuffix.substring(fileSuffix.lastIndexOf('.'))
      if (fileSuffix === '.hevc') {
        fileSuffix = '.mp4'
      }
      // 生成本地文件路径
      localPath = localFolder + '\\' + fileId + fileSuffix
    } else if (partType == 'temp') {
      localFolder = localFolder + '/temp/'
      if (!fs.existsSync(localFolder)) {
        mkdirs(localFolder)
      }
      localPath = localFolder + '/' + fileId
    }
    if (showCover) {
      localPath = localPath + cover_image_suffix
    }
    // 解析本地路径
    resolve(localPath)
  })
}

// 下载头像
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

// 创建封面
const createCover = (filePath) => {
  return new Promise(async (resolve, reject) => {
    // 获取ffmpeg的路径
    let ffmpegPath = getFFmegPath()
    // 获取临时头像路径
    let avatarPath = await getLocalFilePath('avatar', false, store.getUserId() + '_temp')
    // 执行ffmpeg命令生成头像
    let command = `${ffmpegPath} -i "${filePath}" "${avatarPath}" -y`
    await execCommand(command)

    // 获取临时封面路径
    let coverPath = await getLocalFilePath('avatar', false, store.getUserId() + '_temp_cover')
    // 执行ffmpeg命令生成封面
    command = `${ffmpegPath} -i "${filePath}" -y -vframes 1 -vf "scale=min(60\\,iw*min(60/iw\\,60/ih)):min(60\\,ih*min(60/iw\\,60/ih))" "${coverPath}"`
    await execCommand(command)

    // 解析头像和封面流
    resolve({
      avatarStream: fs.readFileSync(avatarPath),
      coverStream: fs.readFileSync(coverPath)
    })
  })
}

// 主动下载文件
const saveAs = async ({ partType, fileId }) => {
  // 初始化文件名变量
  let fileName = ''
  // 根据partType判断文件名
  if (partType == 'avatar') {
    fileName = fileId + image_suffix
  } else if (partType == 'chat') {
    let messageInfo = await selectByMessageId(fileId)
    fileName = messageInfo.fileName
  }
  // 获取本地文件路径
  const localPath = await getLocalFilePath(partType, false, fileId)
  // 配置保存文件对话框的选项
  const options = {
    title: '保存文件', // 对话框标题
    defaultPath: fileName
  }
  // 显示保存文件的对话框
  let result = await dialog.showSaveDialog(options)
  // 如果用户取消保存或未选择路径，返回
  if (result.canceled || result.filePath == '') {
    return
  }
  // 获取用户选择的文件路径
  const filePath = result.filePath
  // 将本地文件复制到用户选择的路径
  fs.copyFileSync(localPath, filePath)
}

// 保存剪切板内容
const saveClipBoardFile = async (file) => {
  // 获取文件后缀名
  const fileSuffix = file.name.substring(file.name.lastIndexOf('.'))
  // 获取本地文件路径，存储在 'tmp' 文件夹中，文件名为 'tmp' + 文件后缀名
  const filePath = await getLocalFilePath('temp', false, 'temp' + fileSuffix)
  // 获取文件的字节数组
  let byteArray = file.byteArray
  // 将字节数组转换为 Buffer 对象
  const buffer = Buffer.from(byteArray)
  // 将 Buffer 写入到指定的文件路径
  fs.writeFileSync(filePath, buffer)
  // 返回文件的大小、名称和路径
  return {
    size: byteArray.length,
    name: file.name,
    path: filePath
  }
}

export { saveFile2Local, getLocalFilePath, downloadFile, createCover, saveAs, saveClipBoardFile }
