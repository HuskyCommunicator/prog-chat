import store from './store.js'
import { ipcMain } from 'electron'
import { initWs } from './wsClient.js'

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
    callback(config)
    // 初始化WebSocket连接
    initWs(config, e.sender)
  })
}

// 设置本地存储数据
export const onSetLocalStore = () => {
  ipcMain.on('setLocalStore', (e, { key, value }) => {
    store.setData(key, value)
    console.log(store.getData(key))
  })
}

// 获取本地存储数据
export const onGetLocalStore = () => {
  ipcMain.on('getLocalStore', (e, key) => {
    console.log('收到渲染进程的获取事件key', key)
    e.sender.send('getLocalStoreCallBack', '主进程返回的内容:', store.getData(key))
  })
}

// 窗口标题操作
export const winTitleOp = (callback) => {
  ipcMain.on('winTitleOp', (e, data) => {
    callback(e, data)
  })
}
