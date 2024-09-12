import store from './store.js'
import { ipcMain } from 'electron'
import { initWs } from './wsClient.js'
import { addUserSetting } from './db/UserSettingModel.js'
import { delChatSession, readAll, selectUserSessionList, topChatSession, updateSessionInfo4Message } from './db/ChatSessionUserModel.js'
import { saveMessage, selectMessageList, updateMessage } from './db/ChatMessageModel.js'
import { saveFile2Local } from './file.js'
// 处理登录或注册事件
export const onLoginOrRegister = (callback) => {
  ipcMain.on('loginOrRegister', (e, isLogin) => {
    callback(isLogin)
  })
}

// 处理登录成功事件
export const onLoginSuccess = (callback) => {
  ipcMain.on('openChat', (e, config) => {
    // 初始化用户ID并设置用户Token
    store.initUserId(config.userId)
    store.setUserData('token', config.token)
    // 用户配置
    addUserSetting(config.userId, config.email)
    callback(config)
    // 初始化WebSocket连接
    initWs(config, e.sender)
  })
}

// 设置本地存储数据
export const onSetLocalStore = () => {
  ipcMain.on('setLocalStore', (e, { key, value }) => {
    store.setData(key, value)
  })
}

// 获取本地存储数据
export const onGetLocalStore = () => {
  ipcMain.on('getLocalStore', (e, key) => {
    e.sender.send('getLocalStoreCallBack', '主进程返回的内容:', store.getData(key))
  })
}

// 窗口标题操作
export const winTitleOp = (callback) => {
  ipcMain.on('winTitleOp', (e, data) => {
    callback(e, data)
  })
}

//
export const onLoadSessionData = () => {
  ipcMain.on('loadSessionData', async (e) => {
    const dataList = await selectUserSessionList()
    e.sender.send('loadSessionDataCallBack', dataList)
  })
}

//
export const onDelChatSession = () => {
  ipcMain.on('delChatSession', async (e, contactId) => {
    delChatSession(contactId)
  })
}

//
export const onTopChatSession = () => {
  ipcMain.on('topChatSession', (e, { contactId, topType }) => {
    topChatSession(contactId, topType)
  })
}

//
export const onLoadChatMessage = () => {
  ipcMain.on('loadChatMessage', async (e, data) => {
    const result = await selectMessageList(data)
    e.sender.send('loadChatMessageCallBack', result)
  })
}

//
export const onAddLocalMessage = () => {
  ipcMain.on('addLocalMessage', async (e, data) => {
    await saveMessage(data)
    if ((data.messageType = 5)) {
      await saveFile2Local(data.messageId, data.filePath, data.fileType)

      const updateInfo = {
        status: 1
      }
      await updateMessage(updateInfo, { messageId: data.messageId })
    }

    //更新session
    data.lastReceiveTime = data.sendTime
    //TODO更新会话
    updateSessionInfo4Message(store.getUserData('currentSessionId'), data)
    e.sender.send('addLocalCallback', { messageId: data.messageId, status: 1 })
  })
}

//
export const onSetSession = () => {
  ipcMain.on('setSessionSelect', async (e, { contactId, sessionId }) => {
    if (sessionId) {
      store.setUserData('currentSessionId', sessionId)
      readAll(contactId)
    } else {
      store.deleteUserData('currentSessionId')
    }
  })
}
