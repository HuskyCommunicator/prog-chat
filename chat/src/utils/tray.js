import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import icon from '../../resources/icon.png?asset'
import { onLoginOrRegister, onLoginSuccess, winTitleOp, onSetLocalStore, onGetLocalStore } from './ipc.js'
export const tray = (mainWindow) => {
  const tray = new Tray(icon)
  const contextMenu = [
    {
      label: '显示主页面',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '退出',
      click: () => {
        app.exit()
      }
    }
  ]
  const menu = Menu.buildFromTemplate(contextMenu)
  tray.setContextMenu(menu)
  tray.setToolTip('Chat')
  tray.on('click', () => {
    mainWindow.setSkipTaskbar(false)
    mainWindow.show()
  })
  // //监听登录成功后的主页面跳转
  // onLoginSuccess((config) => {
  //   mainWindow.resizable = true
  //   mainWindow.setSize(850, 800)
  //   mainWindow.center()
  //   mainWindow.setMaximizable(true)
  //   mainWindow.setMinimumSize(800, 600)

  //   //管理员窗口操作
  //   if (config.admin) {
  //   }
  //   contextMenu.unshift({
  //     label: '用户:' + config.nickName,
  //     click: () => {}
  //   })
  // })
}
