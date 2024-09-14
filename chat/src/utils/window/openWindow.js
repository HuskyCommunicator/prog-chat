/**
 * 该文件包含用于创建和管理 Electron 窗口的函数。
 *
 * 主要功能包括：
 * - 导入必要的模块和资源
 * - 定义并导出 `openWindow` 函数，用于打开新窗口或显示已有窗口
 * - 设置窗口的各种属性和行为，例如图标、尺寸、透明度等
 * - 处理窗口的生命周期事件，例如显示、关闭等
 *
 * @module windowManager
 */

import { app, shell, BrowserWindow, Menu, Tray } from 'electron' // 从 'electron' 模块导入所需的类和函数
import { join } from 'path' // 从 'path' 模块导入 'join' 函数，用于处理文件路径
import { is } from 'electron-util' // 从 'electron-util' 模块导入 'is' 函数，用于检查当前环境
import store from '../../main/store' // 导入自定义的 'store' 模块
import { getWindow, saveWindow, delWindow } from './windowProxy' // 从 'windowProxy' 模块导入窗口管理函数
const { nativeImage } = require('electron')
const icon = nativeImage.createFromPath('../../resources/icon.png')
const NODE_ENV = process.env.NODE_ENV // 从环境变量中获取 'NODE_ENV'

// 定义一个函数，用于打开新窗口
export const openWindow = ({ windowId, title = 'EasyChat', path, width = 960, height = 720, data }) => {
  const localServerPort = store.getUserData('localServerPort') // 从存储中获取本地服务器端口
  data.localServerPort = localServerPort // 将本地服务器端口添加到数据对象中
  let newWindow = getWindow(windowId) // 尝试获取已有的窗口实例
  if (!newWindow) {
    // 如果窗口不存在，则创建新窗口
    newWindow = new BrowserWindow({
      icon: icon, // 设置窗口图标
      width: width, // 设置窗口宽度
      height: height, // 设置窗口高度
      fullscreenable: false, // 禁用全屏模式
      fullscreen: false, // 禁用全屏
      maximizable: false, // 禁用最大化
      autoHideMenuBar: true, // 自动隐藏菜单栏
      resizable: true, // 允许调整窗口大小
      titleBarStyle: 'hidden', // 隐藏标题栏
      frame: true, // 显示窗口边框
      transparent: false, // 设置窗口透明
      hasShadow: false, // 禁用窗口阴影
      frame: false, // 无边框窗口
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'), // 预加载脚本路径
        sandbox: false, // 禁用沙盒模式
        contextIsolation: false // 禁用上下文隔离
      }
    })
    // 保存窗口实例
    saveWindow(windowId, newWindow)
    newWindow.setMinimumSize(600, 484) // 设置窗口最小尺寸
    // 如果是开发环境并且存在渲染器 URL
    if (process.env['ELECTRON_RENDERER_URL']) {
      newWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html#${path}`) // 加载开发环境 URL
    } else {
      newWindow.loadFile(join(__dirname, `../renderer/index.html`), { hash: `${path}` }) // 加载生产环境文件
    }
    // 如果是开发环境，打开开发者工具
    if (NODE_ENV === 'development') {
      newWindow.webContents.openDevTools()
    }

    // 当窗口准备显示时，设置窗口标题并显示窗口
    newWindow.on('ready-to-show', () => {
      console.log('设置title', title)
      newWindow.setTitle(title)
      newWindow.show()
    })

    // 当窗口显示时，发送初始化数据
    newWindow.once('show', () => {
      setTimeout(() => {
        newWindow.webContents.send('pageInitData', data)
      }, 500)
    })
    // 当窗口关闭时，删除窗口实例
    newWindow.on('closed', () => {
      console.log('关闭窗口')
      delWindow(windowId)
    })
  } else {
    // 如果窗口已存在，则显示窗口并发送初始化数据
    newWindow.show()
    newWindow.setSkipTaskbar(false)
    newWindow.webContents.send('pageInitData', data)
  }
}
