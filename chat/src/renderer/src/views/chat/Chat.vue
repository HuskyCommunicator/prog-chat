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

// 接收消息
const onReceiveMessage = () => {
  window.ipcRenderer.on('receiveChatMessage', (e, message) => {
    // 处理接收到的消息
    console.log('收到消息', message)
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
      //TODO滚动条滚动到最底部
    }
    // console.log(messageList.value)
  })
}

// 组件挂载时的初始化操作
onMounted(() => {
  loadChatSession()
  onReceiveMessage()
  onLoadSessionData(), onLoadChatMessage()
})

// 组件卸载时的清理操作
onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('receiveChatMessage')
  window.ipcRenderer.removeAllListeners('loadSessionDataCallBack')
  window.ipcRenderer.removeAllListeners('loadChatMessage')
})
const showMediaDetailHandler = () => {}
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
          <ChatSession :data="item" @click="chatSessionClickHandler(item)" @contextmenu="(e) => onContextMenu(e, item)"></ChatSession>
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
        <MessageSend ref="messageSendRef" :currentChatSession="currentChatSession"> </MessageSend>
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
