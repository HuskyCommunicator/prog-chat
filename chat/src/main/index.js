// 导入electron相关的模块
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { onLoginOrRegister, onLoginSuccess } from './ipc.js'

const NODE_ENV = process.env.NODE_ENV
const login_width = 300
const login_height = 370
const register_height = 490

// 创建窗口的函数
function createWindow() {
  // 创建一个新的浏览器窗口
  const mainWindow = new BrowserWindow({
    icon: icon,
    width: login_width,
    height: login_height,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    frame: true,
    transparent: true,
    titleBarStyle: 'hidden',

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false
    }
  })

  // 如果是开发环境，打开开发者工具
  if (NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // 当窗口准备好显示时，显示窗口
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setTitle('Chat')
  })

  // 设置窗口打开处理器
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于electron-vite cli的渲染器HMR
  // 如果是开发环境，加载远程URL，否则加载本地html文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  //监听登陆注册
  onLoginOrRegister((isLogin) => {
    mainWindow.resizable = true
    if (isLogin) {
      mainWindow.setSize(login_width, login_height)
    } else {
      mainWindow.setSize(login_width, register_height)
    }
    mainWindow.resizable = false
  })
  //监听登录成功后的主页面跳转
  onLoginSuccess((config) => {
    mainWindow.resizable = true
    mainWindow.setSize(850, 800)
    mainWindow.center()
    mainWindow.setMaximizable = true
    mainWindow.setMinimumSize(800, 600)
    mainWindow.resizable = false
    //管理员窗口操作
    if (config.admin) {
    }
  })
}

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法
// 有些API只能在此事件发生后使用
app.whenReady().then(() => {
  // 为windows设置应用用户模型id
  electronApp.setAppUserModelId('com.electron')

  // 默认在开发环境中通过F12打开或关闭DevTools
  // 并在生产环境中忽略CommandOrControl + R
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 在macOS上，当单击dock图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都被关闭时退出，除了macOS。在那里，应用程序及其菜单栏通常会保持活动状态，直到用户使用Cmd + Q显式退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
