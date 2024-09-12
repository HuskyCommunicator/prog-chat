<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import ChatSession from './ChatSession.vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import 'default-passive-events'
import MessageSend from './MessageSend.vue'
import ChatMessage from './ChatMessage.vue'
// 获取当前实例的代理对象
const { proxy } = getCurrentInstance()

// 当前选中的会话
const currentChatSession = ref({})

//设置获取会话的消息分页
const messageCountInfo = {
  totalPage: 0,
  pageNo: 0,
  maxMessageId: null,
  noData: false
}
//当前会话消息记录
const messageList = ref([])

// 搜索功能
const search = () => {}
const searchKey = ref('')

// 聊天会话列表
const chatSessionList = ref([])

// 加载聊天会话
const loadChatSession = () => {
  window.ipcRenderer.send('loadSessionData')
}

// 设置置顶
const setTop = (data) => {
  // 切换置顶状态
  data.topType = data.topType == 0 ? 1 : 0
  // 排序会话列表
  sortChatSessionList(chatSessionList.value)
  // 发送置顶状态更新消息
  window.ipcRenderer.send('topChatSession', { contactId: data.contactId, topType: data.topType })
}

// 排序会话列表
const sortChatSessionList = (dataList) => {
  dataList.sort((a, b) => {
    const topTypeResult = b['topType'] - a['topType']
    if (topTypeResult == 0) {
      return b['lastReceiveTime'] - a['lastReceiveTime']
    }
    return topTypeResult
  })
}

// 删除会话列表中的会话
const delChatSessionList = (contactId) => {
  chatSessionList.value = chatSessionList.value.filter((item) => item.contactId !== contactId)
}

// 删除聊天会话
const delChatSession = (contactId) => {
  delChatSessionList(contactId)
  currentChatSession.value = {}
  // 发送删除会话消息
  window.ipcRenderer.send('delChatSession', contactId)
}

// 组件内右键菜单
const onContextMenu = (e, data) => {
  e.preventDefault() // 防止浏览器默认的右键菜单
  ContextMenu.showContextMenu({
    x: e.clientX,
    y: e.clientY,
    items: [
      {
        label: data.topType == 0 ? '置顶' : '取消置顶',
        onClick: () => {
          setTop(data)
        }
      },
      {
        label: '删除聊天',
        onClick: () =>
          proxy.Confirm({
            message: `确定要删除聊天【${data.contactName}】吗?`,
            okfun: async () => {
              // 调用删除聊天会话的方法
              delChatSession(data.contactId)
            }
          })
      }
    ]
  })
}

//切换会话
const chatSessionClickHandler = (item) => {
  currentChatSession.value = Object.assign({}, item)
  //TODO清空消息记录数
  messageList.value = []
  messageCountInfo.pageNo = 0
  messageCountInfo.totalPage = 1
  messageCountInfo.maxMessageId = null
  messageCountInfo.noData = false
  loadChatMessage()
  //TO USE P37 6:00 获取聊天记录时涉及分页 但是在分页时又收到消息就会导致获取数据出错
  setSessionSelect({ contactId: item.contactId, sessionId: item.sessionId })
}
//
const setSessionSelect = ({ contactId, sessionId }) => {
  window.ipcRenderer.send('setSessionSelect', { contactId, sessionId })
}
//加载会话消息
const loadChatMessage = () => {
  if (messageCountInfo.noData) {
    return console.log('没有更多数据供加载')
  }
  messageCountInfo.pageNo++
  window.ipcRenderer.send('loadChatMessage', {
    sessionId: currentChatSession.value.sessionId,
    pageNo: messageCountInfo.pageNo,
    maxMessageId: messageCountInfo.maxMessageId
  })
}

// 定义一个函数，用于接收消息
const onReceiveMessage = () => {
  // 监听 'receiveChatMessage' 事件
  window.ipcRenderer.on('receiveChatMessage', (e, message) => {
    // 打印接收到的消息，用于调试
    // 在 chatSessionList 中查找与接收到的消息的 sessionId 匹配的会话
    let curSession = chatSessionList.value.find((item) => {
      return item.sessionId == message.sessionId
    })

    // 如果没有找到匹配的会话
    if (curSession == null) {
      // 将消息的扩展数据添加到 chatSessionList 中
      chatSessionList.value.push(message.extendData)
    } else {
      // 将消息的扩展数据合并到找到的会话对象中
      Object.assign(curSession, message.extendData)
    }

    // 对 chatSessionList 进行排序
    sortChatSessionList(chatSessionList.value)

    // 如果接收到的消息的 sessionId 与当前会话的 sessionId 不匹配
    if (message.sessionId != currentChatSession.value.sessionId) {
      // TODO 展示未读消息气泡
    } else {
      // 将消息的扩展数据合并到当前会话对象中
      Object.assign(currentChatSession.value, message.extendData)
      // 将接收到的消息添加到消息列表中
      messageList.value.push(message)
      // 滚动到消息列表的底部
      goToBottom()
    }
  })
}

// 处理加载会话数据的回调
const onLoadSessionData = () => {
  window.ipcRenderer.on('loadSessionDataCallBack', (e, dataList) => {
    sortChatSessionList(dataList)
    chatSessionList.value = dataList
  })
}
//处理加载会话分页的回调
const onLoadChatMessage = () => {
  window.ipcRenderer.on('loadChatMessageCallBack', (e, { dataList, pageTotal, pageNo }) => {
    if (pageNo == pageTotal) {
      messageCountInfo.noData = true
    }
    dataList.sort((a, b) => {
      return a.messageId - b.messageId
    })
    messageList.value = dataList.concat(messageList.value)
    messageCountInfo.pageNo = pageNo
    messageCountInfo.pageTotal = pageTotal
    if (pageNo == 1) {
      messageCountInfo.maxMessageId = dataList.length > 0 ? dataList[dataList.length - 1].messageId : null
      goToBottom
    }
  })
}
//处理文件发送后更新
const onAddLocalMessage = () => {
  window.ipcRenderer.on('addLocalCallback', (e, { messageId, status }) => {
    const findMessage = messageList.value.find((item) => {
      if (item.messageId == messageId) {
        return item
      }
    })
    if (findMessage != null) {
      findMessage.status = status
    }
  })
}
// 组件挂载时的初始化操作
onMounted(() => {
  onReceiveMessage(), loadChatSession(), onLoadSessionData(), onLoadChatMessage(), onAddLocalMessage()
})

// 组件卸载时的清理操作
onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('receiveChatMessage')
  window.ipcRenderer.removeAllListeners('loadSessionDataCallBack')
  window.ipcRenderer.removeAllListeners('loadChatMessage')
  window.ipcRenderer.removeAllListeners('addLocalCallback')
})
const sendMessage4LocalHandler = (messageObj) => {
  // 将传入的消息对象添加到消息列表中
  messageList.value.push(messageObj)

  // 在聊天会话列表中查找与消息对象的 sessionId 匹配的会话
  const chatSession = chatSessionList.value.find((item) => {
    return item.sessionId == messageObj.sessionId
  })

  // 如果找到匹配的会话对象
  if (chatSession) {
    // 更新会话的最后一条消息和最后接收时间
    chatSession.lastMessage = messageObj.lastMessage
    chatSession.lastReceiveTime = messageObj.sendTime
  }

  // 对聊天会话列表进行排序
  sortChatSessionList(chatSessionList.value)

  // 滚动到消息列表的底部
  goToBottom()
}

//滚动到底部
const goToBottom = () => {
  // 在下一个 DOM 更新周期后执行回调函数
  nextTick(() => {
    // 选择所有具有类名 'message-item' 的 DOM 元素
    const items = document.querySelectorAll('.message-item')
    // 如果找到的元素数量大于 0
    if (items.length > 0) {
      // 设置一个 100 毫秒的延迟后执行回调函数
      setTimeout(() => {
        // 滚动到最后一个元素的位置
        items[items.length - 1].scrollIntoView()
      }, 100)
    }
  })
}
</script>

<template>
  <Layout>
    <template #left-content>
      <div class="drag-panel drag"></div>
      <div class="top-search">
        <el-input clearable placeholder="搜索" v-model="searchKey" size="small" @keyup="search">
          <template #suffix>
            <span class="iconfont icon-search"></span>
          </template>
        </el-input>
      </div>
      <div class="chat-session-list">
        <template v-for="item in chatSessionList">
          <ChatSession
            :data="item"
            @click="chatSessionClickHandler(item)"
            @contextmenu="(e) => onContextMenu(e, item)"
            :currentSession="item.contactId == currentChatSession.contactId"
          ></ChatSession>
        </template>
      </div>
    </template>
    <template #right-content>
      <div class="title-panel drag" v-if="Object.keys(currentChatSession).length > 0">
        <div class="title">
          <span>{{ currentChatSession.contactName }}</span>
          <span v-if="currentChatSession.contactType == 1"> ({{ currentChatSession.memberCount }}) </span>
        </div>
      </div>
      <div v-if="currentChatSession.contactType == 1" class="iconfont icon-more no-drag" @click="showGroupDetail"></div>
      <div class="chat-panel" v-show="Object.keys(currentChatSession).length > 0">
        <div class="message-panel" id="message-panel">
          <div class="message-item" v-for="(data, index) in messageList" :id="'message' + data.messageId">
            <template v-if="data.messageType == 1 || data.messageType == 2 || data.messageType == 5">
              <ChatMessage :data="data" :currentChatSession="currentChatSession"></ChatMessage>
            </template>
          </div>
        </div>
        <MessageSend ref="messageSendRef" :currentChatSession="currentChatSession" @sendMessage4Local="sendMessage4LocalHandler"> </MessageSend>
      </div>
    </template>
  </Layout>
</template>

<style lang="scss" scoped>
.drag-panel {
  height: 25px;
  background: #f7f7f7;
}

.top-search {
  padding: 0px 10px 9px 10px;
  background: #f7f7f7;
  display: flex;
  align-items: center;
}

.iconfont {
  font-size: 12px;
}

.chat-session-list {
  height: calc(100vh - 62px);
  overflow: hidden;
  border-top: 1px solid #ddd;
}

.chat-session-list:hover {
  overflow: auto;
}
.search-list {
  height: calc(100vh - 62px);
  background: #f7f7f7;
  overflow: hidden;
}

.search-list:hover {
  overflow: auto;
}

.title-panel {
  display: flex;
  align-items: center;
}

.title {
  height: 60px;
  line-height: 60px;
  padding-left: 10px;
  font-size: 18px;
  color: #000000;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-more {
  position: absolute;
  z-index: 1;
  top: 30px;
  right: 3px;
  width: 20px;
  font-size: 20px;
  margin-right: 5px;
  cursor: pointer;
}

.chat-panel {
  border-top: 1px solid #ddd;
  background: #f5f5f5;
}

.message-panel {
  padding: 10px 30px;
  height: calc(100vh - 200px - 62px);
  overflow-y: auto;
}

.message-item {
  margin-bottom: 15px;
  text-align: center;
}
</style>
