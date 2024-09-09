// listeners.js
import { ipcMain } from 'electron'

export function changeWindowSize(mainWindow) {
  ipcMain.on('maxOrMin', (e, isMax) => {
    mainWindow.setResizable(true)
    if (!isMax) {
      mainWindow.setSize(1200, 800)
    } else {
      mainWindow.setSize(300, 400)
    }
    mainWindow.setResizable(false)
  })
}
export function winTitle(BrowserWindow) {
  ipcMain.on('winTitleOp', (e, { action, data }) => {
    const webContents = e.sender
    const win = BrowserWindow.fromWebContents(webContents)
    switch (action) {
      //关闭
      case 'close': {
        if (data.closeType == 0) {
          //若应用还未登录，则关闭应用
          win.close()
        } else {
          //若应用已登录，则最小化到托盘
          win.setSkipTaskbar(true)
          win.hide()
        }
        break
      }
      //最小化
      case 'minimize': {
        win.minimize()
        break
      }
      //最大化-当前应用未最大化
      case 'maximize': {
        win.maximize()
        break
      }
      //最大化-当前应用已最大化
      case 'unmaximize': {
        win.unmaximize()
        break
      }
      //置顶
      case 'top': {
        win.setAlwaysOnTop(data.top)
        break
      }
    }
  })
}
