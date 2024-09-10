import { run, queryAll, queryOne, queryCount, insert, insertOrReplace, insertIgnore, update, deleteData } from './ADB'
import store from '../store'
import os from 'os'
const fs = require('fs')
const NODE_ENV = process.env.NODE_ENV
const userDir = os.homedir()

// 根据环境变量设置数据库文件夹路径
const dbFolder = userDir + (NODE_ENV === 'development' ? '/.easychatdev/' : '/.easychat/')
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
  // 获取当前最大的server_port
  let sql = 'select max(server_port) server_port from user_setting'
  let { serverPort } = await queryOne(sql, [])
  if (serverPort == null) {
    serverPort = 10240
  } else {
    serverPort++
  }
  const sysSetting = {
    localFileFolder: userDir + '\\.easychat\\fileStorage\\'
  }
  // 检查用户设置是否已存在
  sql = 'select * from user_setting where user_id= ?'
  const userInfo = await queryOne(sql, [userId])

  let resultServerPort = null
  let localFileFolder = sysSetting.localFileFolder + userId

  if (userInfo) {
    // 如果用户设置已存在，更新email
    await update('user_setting', { email: email }, { userId: userId })
    resultServerPort = userInfo.serverPort
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
    resultServerPort = serverPort
  }
  //TODO 启动本地服务
  store.setUserData('localServerPort', resultServerPort)
  store.setUserData('localFileFolder', localFileFolder)
}

export { updateContactNoReadCount, addUserSetting }
