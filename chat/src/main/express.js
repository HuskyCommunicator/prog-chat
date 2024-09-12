//创建express服务
const express = require('express')
const expressServer = express()
const fs = require('fs')
import { getLocalFilePath } from './file'

// 添加中间件来解析 JSON 请求体
expressServer.use(express.json())
expressServer.use(express.urlencoded({ extended: true }))

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

//
expressServer.get('/file', async (req, res) => {
  let { partType, fileType, fileId, showCover, forceGet } = req.query
  //如果没有指定partType或fileId，则返回错误
  if (!partType || !fileId) {
    return res.status(400).send('请求参数错误')
  }
  //确保 showCover 始终是一个布尔值
  showCover = showCover == undefined ? false : Boolean(showCover)
  const localPath = await getLocalFilePath(partType, showCover, fileId)
  //在文件不存在或需要强制下载时，执行文件下载操作
  if (!fs.existsSync(localPath) || forceGet == 'true') {
    //获取头像原图
    await downloadFile()
    if (forceGet == 'true' && partType == 'avatar') {
      //获取头像缩略图
      await downloadFile()
    }
  }
  // 获取文件的后缀名
  const fileSuffix = localPath.substring(localPath.lastIndexOf('.') + 1)
  // 根据文件类型和后缀名生成内容类型
  let contentType = FILE_TYPE_CONTENT_TYPE[fileType] + fileSuffix
  console.log('fileSuffix', fileSuffix)
  console.log('fileType', fileType)
  console.log('contentType', contentType)
  // 设置响应头，允许所有来源的跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*')
  // 设置响应头，指定内容类型
  res.setHeader('Content-Type', contentType)
  // 创建文件读取流，并将其内容通过响应管道发送给客户端
  fs.createReadStream(localPath).pipe(res)
  return 1
})

//下载头像
const downloadFile = () => {
  return 1
}

//关闭express服务
const closeLocalServer = () => {
  if (server) {
    server.close()
  }
}
export { startLocalServer, closeLocalServer }
