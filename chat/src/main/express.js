//创建express服务
const express = require('express')
const expressServer = express()
const fs = require('fs')
const cors = require('cors')
import store from './store'
import { downloadFile, getLocalFilePath } from './file'

// 添加中间件来解析 JSON 请求体
expressServer.use(express.json())
expressServer.use(express.urlencoded({ extended: true }))
expressServer.use(cors())
//启动express服务
let server = null
const startLocalServer = (serverPort) => {
  server = expressServer.listen(serverPort, () => {
    console.log('本地服务已启动http://127.0.0.1:' + serverPort)
  })
}

//规定文件类型
const FILE_TYPE_CONTENT_TYPE = {
  0: 'image/',
  1: 'video/',
  default: 'application/octet-stream'
}
//缩略图后缀
const cover_image_suffix = '_cover.png'
const image_suffix = '.png'

//
expressServer.get('/file', async (req, res) => {
  let { partType, fileType, fileId, showCover, forceGet } = req.query
  console.log('收到请求,信息为: fileId:', fileId, 'partType:', partType, 'fileType:', fileType, 'showCover:')

  // 如果没有指定partType或fileId，则返回错误
  if (!partType || !fileId) {
    res.status(400).send('请求参数错误')
    return
  }

  // 确保 showCover 始终是一个布尔值
  showCover = showCover == undefined ? false : Boolean(showCover)
  const localPath = await getLocalFilePath(partType, showCover, fileId)
  // console.log('Local path:', localPath)

  // 在文件不存在或需要强制下载时，执行文件下载操作
  if (!fs.existsSync(localPath) || forceGet == 'true') {
    await downloadFile(fileId, showCover, localPath, partType)
    if (forceGet == 'true' && partType == 'avatar') {
      // 获取头像缩略图
      await downloadFile(fileId, true, localPath + cover_image_suffix, partType)
    }
  }

  // 获取文件的后缀名
  const fileSuffix = localPath.substring(localPath.lastIndexOf('.') + 1)
  // console.log('File suffix:', fileSuffix)

  // 根据文件类型和后缀名生成内容类型
  let contentType = FILE_TYPE_CONTENT_TYPE[fileType] + fileSuffix
  //console.log('Content type:', contentType)

  // 设置响应头，允许所有来源的跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  // 设置响应头，指定内容类型
  res.setHeader('Content-Type', contentType)

  // 创建文件读取流，并将其内容通过响应管道发送给客户端
  //当数据为图像或文件时
  if (showCover || fileType != '1') {
    fs.createReadStream(localPath).pipe(res)
    return
  }
  // 获取视频文件的状态信息
  let stat = fs.statSync(localPath)
  // 获取视频文件的大小
  let fileSize = stat.size
  // 获取请求头中的range字段
  let range = req.headers.range

  // 如果请求头中包含range字段
  if (range) {
    // 使用206状态码表示部分内容响应
    // 将range字段的值去掉'bytes='前缀，并按'-'分割成数组
    let parts = range.replace(/bytes=/, '').split('-')
    // 获取range的起始位置
    let start = parseInt(parts[0], 10)
    // 获取range的结束位置，如果没有指定结束位置，则默认结束位置为起始位置加999999
    let end = parts[1] ? parseInt(parts[1], 10) : start + 999999

    // 确保end不超过文件大小的最后位置
    end = end > fileSize - 1 ? fileSize - 1 : end

    // 计算要发送的内容长度
    let chunksize = end - start + 1
    // 创建文件读取流，指定读取的起始和结束位置
    let stream = fs.createReadStream(localPath, {
      start,
      end
    })
    // 设置响应头，包含内容范围、接受范围、内容长度和内容类型
    let head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    }
    // 发送206状态码和响应头
    res.writeHead(206, head)
    // 将文件流写入响应
    stream.pipe(res)
  } else {
    // 如果请求头中不包含range字段
    // 设置响应头，包含内容长度和内容类型
    let head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    }
    // 发送200状态码和响应头
    res.writeHead(200, head)
    // 将整个文件流写入响应
    fs.createReadStream(localPath).pipe(res)
  }
})

//关闭express服务
const closeLocalServer = () => {
  if (server) {
    server.close()
  }
}
export { startLocalServer, closeLocalServer }
