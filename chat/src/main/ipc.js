import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

export const onLoginOrRegister = (callback) => {
  ipcMain.on('loginOrRegister', (e, isLogin) => {
    callback(isLogin)
  })
}
export const onLoginSuccess = (callback) => {
  ipcMain.on('openChat', (e, config) => {
    callback(config)
  })
}
