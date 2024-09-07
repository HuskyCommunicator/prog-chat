import store from './store.js'
import { ipcMain } from 'electron'
export const onLoginOrRegister = (callback) => {
  ipcMain.on('loginOrRegister', (e, isLogin) => {
    callback(isLogin)
  })
}
export const onLoginSuccess = (callback) => {
  ipcMain.on('openChat', (e, config) => {
    store.initUserId(config.userId), store.setUserData('token', config.token)
    //用户配置
    callback(config)
    //初始化ws链接
  })
}
export const onSetLocalStore = () => {
  ipcMain.on('setLocalStore', (e, { key, value }) => {
    store.setData(key, value)
    console.log(store.getData(key))
  })
}
export const onGetLocalStore = () => {
  ipcMain.on('getLocalStore', (e, key) => {
    console.log('收到渲染进程的获取事件key', key)
    e.sender.send('getLocalStoreCallBack', '主进程返回的内容:', store.getData(key))
  })
}
export const winTitleOp = (callback) => {
  ipcMain.on('winTitleOp', (e, data) => {
    callback(e, data)
  })
}
