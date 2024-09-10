<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import ChatSession from './ChatSession.vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import 'default-passive-events'

const { proxy } = getCurrentInstance()
//当前选中的会话
const currentChatSession = ref({})
// 搜索功能
const search = () => {}
const searchKey = ref('')

// 聊天会话列表
const chatSessionList = ref([])

// 接收消息
const onReceiveMessage = () => {
  window.ipcRenderer.on('receiveChatMessage', (e, message) => {
    // 处理接收到的消息
  })
}

// 加载聊天会话
const loadChatSession = () => {
  window.ipcRenderer.send('loadSessionData')
}

// 处理加载会话数据的回调
const onLoadSessionData = () => {
  window.ipcRenderer.on('loadSessionDataCallBack', (e, dataList) => {
    sortChatSessionList(dataList)
    chatSessionList.value = dataList
  })
}

// 设置置顶
const setTop = (data) => {
  // console.log(
  //   '排序前',
  //   chatSessionList.value.map((data) => data.contact_name),
  //   chatSessionList.value.map((data) => data.last_receive_time)
  // )
  data.top_type = data.top_type == 0 ? 1 : 0
  sortChatSessionList(chatSessionList.value)
  // console.log(
  //   '排序后',
  //   chatSessionList.value.map((data) => data.contact_name),
  //   chatSessionList.value.map((data) => data.last_receive_time)
  // )
  //TO ASK 不确定取消置顶的排序是否生效
  window.ipcRenderer.send('topChatSession', { contactId: data.contact_id, topType: data.top_type })
}

//排序会话
const sortChatSessionList = (dataList) => {
  dataList.sort((a, b) => {
    const topTypeResult = b['top_type'] - a['top_type']
    if (topTypeResult == 0) {
      return b['last_receive_time'] - a['last_receive_time']
    }
    return topTypeResult
  })
}

//删除会话
const delChatSessionList = (contactId) => {
  chatSessionList.value = chatSessionList.value.filter((item) => item.contact_id !== contactId)
}

// 删除聊天会话
const delChatSession = (contactId) => {
  delChatSessionList(contactId)
  currentChatSession.value = {}
  //TODO设置选中的会话
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
        label: data.top_type == 0 ? '置顶' : '取消置顶',
        onClick: () => {
          setTop(data)
        }
      },
      {
        label: '删除聊天',
        onClick: () =>
          proxy.Confirm({
            message: `确定要删除聊天【${data.contact_name}】吗?`,
            okfun: async () => {
              // TODO: 调用删除聊天会话的方法
              delChatSession(data.contact_id)
            }
          })
      }
    ]
  })
}

// 组件挂载时的初始化操作
onMounted(() => {
  onReceiveMessage()
  onLoadSessionData()
  loadChatSession()
})
//
onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('receiveChatMessage')
  window.ipcRenderer.removeAllListeners('loadSessionDataCallBack')
})
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
          <ChatSession :data="item" @contextmenu="(e) => onContextMenu(e, item)"></ChatSession>
        </template>
      </div>
    </template>
    <template #right-content> </template>
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
