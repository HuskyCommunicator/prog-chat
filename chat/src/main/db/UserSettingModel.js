import { run, queryAll, queryOne, queryCount, insert, insertOrReplace, insertIgnore, update, deleteData } from './ADB'
import store from '../store'
import os from 'os'
import { startLocalServer } from '../express'
const fs = require('fs')
const NODE_ENV = process.env.NODE_ENV
const userDir = os.homedir()

// 根据环境变量设置数据库文件夹路径
//const dbFolder = userDir + (NODE_ENV === 'development' ? '/.easychatdev/' : '/.easychat/')
const dbFolder = userDir + (NODE_ENV === 'development' ? '/.easychattest/' : '/.easychat/')

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder)
}

// 更新联系人未读消息数
const updateContactNoReadCount = ({ userId, noReadCount }) => {
  return new Promise(async (resolve, reject) => {
    let sql = null
    try {
      if (noReadCount === 0) {
        // 如果未读消息数为0，直接返回
        resolve()
        return
      }
      if (noReadCount) {
        // 增加未读消息数
        sql = 'UPDATE user_setting SET contact_no_read = contact_no_read + ? WHERE user_id = ?'
      } else {
        // 清空未读消息数
        noReadCount = 0
        sql = 'UPDATE user_setting SET contact_no_read = ? WHERE user_id = ?'
      }
      await run(sql, [noReadCount, userId])
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// 添加用户设置
const addUserSetting = async (userId, email) => {
  // 定义查询语句，获取当前最大的 server_port
  let sql = 'select max(server_port) server_port from user_setting'
  // 执行查询语句，并获取查询结果中的 serverPort
  let { serverPort } = await queryOne(sql, [])
  // 如果查询结果为 null，则将 serverPort 设置为 10140，否则自增 1
  if (serverPort == null) {
    serverPort = 10140
  } else {
    serverPort++
  }
  // 定义系统设置对象，包含本地文件夹路径
  const sysSetting = {
    localFileFolder: userDir + '\\.easychat\\fileStorage\\'
  }
  // 定义查询语句，检查用户设置是否已存在
  sql = 'select * from user_setting where user_id= ?'
  // 执行查询语句，并获取查询结果中的用户信息
  const userInfo = await queryOne(sql, [userId])
  // 初始化 resultServerPort 变量为 null
  let resultServerPort = null
  // 定义本地文件夹路径，包含用户 ID
  let localFileFolder = sysSetting.localFileFolder + userId
  // 如果用户设置已存在，更新 email
  if (userInfo) {
    await update('user_setting', { email: email }, { userId: userId })
    // 设置 resultServerPort 为查询结果中的 serverPort
    resultServerPort = userInfo.serverPort
    // 更新本地文件夹路径
    localFileFolder = JSON.parse(userInfo.sysSetting).localFileFolder + userId
  } else {
    // 如果用户设置不存在，插入新的记录
    await insertIgnore('user_setting', {
      userId: userId,
      email: email,
      sysSetting: JSON.stringify(sysSetting),
      contactNoRead: 0,
      serverPort: serverPort
    })
    // 设置 resultServerPort 为新的 serverPort
    resultServerPort = serverPort
  }
  // 启动本地服务
  startLocalServer(resultServerPort)
  // 设置用户数据中的本地服务器端口
  store.setUserData('localServerPort', resultServerPort)
  // 设置用户数据中的本地文件夹路径
  store.setUserData('localFileFolder', localFileFolder)
}

export { updateContactNoReadCount, addUserSetting }
