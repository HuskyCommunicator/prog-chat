import store from './store.js'
import { ipcMain } from 'electron'
import { initWs } from './wsClient.js'
import { addUserSetting } from './db/UserSettingModel.js'
import { delChatSession, readAll, selectUserSessionList, topChatSession, updateSessionInfo4Message } from './db/ChatSessionUserModel.js'
import { saveMessage, selectMessageList, updateMessage } from './db/ChatMessageModel.js'
import { createCover, saveAs, saveClipBoardFile, saveFile2Local } from './file.js'
import { openWindow } from '../utils/window/openWindow.js'

// 处理登录或注册事件
// 监听 'loginOrRegister' 事件，并调用回调函数处理登录或注册逻辑
export const onLoginOrRegister = (callback) => {
  ipcMain.on('loginOrRegister', (e, isLogin) => {
    callback(isLogin)
  })
}

// 处理登录成功事件
// 监听 'openChat' 事件，初始化用户ID和Token，添加用户设置，初始化WebSocket连接，并调用回调函数
export const onLoginSuccess = (callback) => {
  ipcMain.on('openChat', (e, config) => {
    store.initUserId(config.userId)
    store.setUserData('token', config.token)
    addUserSetting(config.userId, config.email)
    callback(config)
    initWs(config, e.sender)
  })
}

// 设置本地存储数据
// 监听 'setLocalStore' 事件，将指定的键值对存储到本地存储中
export const onSetLocalStore = () => {
  ipcMain.on('setLocalStore', (e, { key, value }) => {
    store.setData(key, value)
  })
}

// 获取本地存储数据
// 监听 'getLocalStore' 事件，获取指定键的本地存储数据，并通过回调发送回渲染进程
export const onGetLocalStore = () => {
  ipcMain.on('getLocalStore', (e, key) => {
    e.sender.send('getLocalStoreCallback', store.getData(key))
  })
}

// 窗口标题操作
// 监听 'winTitleOp' 事件，并调用回调函数处理窗口标题操作
export const winTitleOp = (callback) => {
  ipcMain.on('winTitleOp', (e, data) => {
    callback(e, data)
  })
}

// 加载会话数据
// 监听 'loadSessionData' 事件，异步获取用户会话列表数据，并通过回调发送回渲染进程
export const onLoadSessionData = () => {
  ipcMain.on('loadSessionData', async (e) => {
    const dataList = await selectUserSessionList()
    e.sender.send('loadSessionDataCallBack', dataList)
  })
}

// 删除聊天会话
// 监听 'delChatSession' 事件，异步删除指定的聊天会话
export const onDelChatSession = () => {
  ipcMain.on('delChatSession', async (e, contactId) => {
    delChatSession(contactId)
  })
}

// 置顶聊天会话
// 监听 'topChatSession' 事件，置顶或取消置顶指定的聊天会话
export const onTopChatSession = () => {
  ipcMain.on('topChatSession', (e, { contactId, topType }) => {
    topChatSession(contactId, topType)
  })
}

// 加载聊天消息
// 监听 'loadChatMessage' 事件，异步获取指定会话的聊天消息，并通过回调发送回渲染进程
export const onLoadChatMessage = () => {
  ipcMain.on('loadChatMessage', async (e, data) => {
    const result = await selectMessageList(data)
    e.sender.send('loadChatMessageCallBack', result)
  })
}

// 添加本地消息
// 监听 'addLocalMessage' 事件，异步保存消息到本地数据库，并更新会话信息
export const onAddLocalMessage = () => {
  ipcMain.on('addLocalMessage', async (e, data) => {
    await saveMessage(data)
    if (data.messageType == 5) {
      await saveFile2Local(data.messageId, data.filePath, data.fileType)

      const updateInfo = {
        status: 1
      }
      await updateMessage(updateInfo, { messageId: data.messageId })
    }

    // 更新会话信息
    data.lastReceiveTime = data.sendTime
    updateSessionInfo4Message(store.getUserData('currentSessionId'), data)
    e.sender.send('addLocalCallback', { messageId: data.messageId, status: 1 })
  })
}

// 设置当前会话
// 监听 'setSessionSelect' 事件，设置当前会话ID，并标记所有消息为已读
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

// 生成缩略图
// 监听 'createCover' 事件，异步生成缩略图，并通过回调发送回渲染进程
export const onCreateCover = () => {
  ipcMain.on('createCover', async (e, localFilePath) => {
    const stream = await createCover(localFilePath)
    e.sender.send('createCoverCallback', stream)
  })
}

// 查看媒体信息
// 监听 'newWindow' 事件，在发送消息时新开窗口查看图片或视频
export const onOpenNewWindow = () => {
  ipcMain.on('newWindow', (e, config) => {
    openWindow(config)
  })
}

// 聊天界面的主动保存文件
// 监听 'saveAs' 事件，异步保存文件到本地
export const onSaveAs = () => {
  ipcMain.on('saveAs', async (e, data) => {
    saveAs(data)
  })
}

//读取剪切板内容
export const onSaveClipBoardFile = () => {
  ipcMain.on('saveClipBoardFile', async (e, file) => {
    const result = await saveClipBoardFile(file)
    e.sender.send('saveClipBoardFileCallback', result)
  })
}
