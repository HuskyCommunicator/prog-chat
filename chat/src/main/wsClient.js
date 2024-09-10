import { WebSocket } from 'ws'
import store from './store'
import { saveOrUpdateChatSessionBatch4Init } from './db/ChatSessionUserModel'
import { saveMessageBatch } from './db/ChatMessageModel'
import { updateContactNoReadCount } from './db/UserSettingModel'
const NODE_ENV = process.env.NODE_ENV
let ws = null
let maxReConnectTimes = null
let lockReconnect = null
let wsUrl = null
let sender = null
let needReconnect = null

// 初始化 WebSocket 连接
const initWs = (config, _sender) => {
  // 根据环境变量设置 WebSocket URL
  wsUrl = `${NODE_ENV !== 'development' ? store.getData('prodWsDomain') : store.getData('devWsDomain')}?token=${config.token}`

  // 设置发送者
  sender = _sender

  // 是否需要重新连接
  needReconnect = true

  // 最大重连次数
  maxReConnectTimes = 5

  // 创建 WebSocket 连接
  createWs()
}
// 创建 WebSocket 连接的函数
const createWs = () => {
  if (wsUrl == null) {
    return
  }
  ws = new WebSocket(wsUrl)

  // WebSocket 连接成功的回调函数
  ws.onopen = () => {
    ws.send('heart beat')
    maxReConnectTimes = 5
  }

  // 从服务端接收到消息的回调函数
  ws.onmessage = async (e) => {
    sender.send('receiveMessage', e.data)
    const message = JSON.parse(e.data)
    const messageType = message.messageType
    switch (messageType) {
      case 0: //ws链接成功
        //保存会话消息
        await saveOrUpdateChatSessionBatch4Init(message.extendData.chatSessionList)
        //保存消息
        await saveMessageBatch(message.extendData.chatMessageList)
        //更新未读消息
        await updateContactNoReadCount({ userId: store.getUserId(), noReadCount: message.extendData.applyCount })
        //发送消息
        sender.send('receiveChatMessage', { messageType: message.messageType })
        break
    }
  }

  // WebSocket 连接关闭的回调函数
  ws.onclose = () => {
    reconnect()
  }

  // WebSocket 连接错误的回调函数
  ws.onerror = () => {
    reconnect()
  }

  // 重连函数
  const reconnect = () => {
    if (!needReconnect) {
      return
    }
    if (ws !== null) {
      ws.close()
    }
    if (lockReconnect) {
      return
    }
    lockReconnect = true
    if (maxReConnectTimes > 0) {
      console.log(`正在尝试第${maxReConnectTimes}次重连`, new Date().getTime())
      setTimeout(() => {
        createWs()
        lockReconnect = false
      }, 3000)
      maxReConnectTimes--
    } else {
      console.log('重连次数已用完，放弃重连')
      lockReconnect = false
    }
  }

  // 定时发送心跳包
  setInterval(() => {
    if (ws != null && ws.readyState === 1) {
      ws.send('heart beat')
    }
  }, 3000)
}

// 关闭 WebSocket 连接的函数
const closeWs = () => {
  needReconnect = false
  ws.close()
}

export { initWs, createWs, closeWs }
