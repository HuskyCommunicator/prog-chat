<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import { useUserInfoStore } from '@/stores/UserInfoStore.js'
import emojiList from '@/utils/Emoji.js'
import SearchAdd from '@/views/contact/SearchAdd.vue'
import { getFileType } from '@/utils/Constants.js'
import { useSysSettingStore } from '@/stores/SysSettingStore'
// 获取用户信息存储
const userInfoStore = useUserInfoStore()
const sysSettingStore = useSysSettingStore()
// 获取当前实例的代理
const { proxy } = getCurrentInstance()

const activeEmoji = ref('笑脸')
const msgContent = ref('')

//文件个数超过指定值
const uploadExceed = (files) => {
  checkFileLimit(files)
}

// 定义事件发射器
const emit = defineEmits(['sendMessage4Local'])

// 定义组件的 props
const props = defineProps({
  currentChatSession: {
    type: Object,
    default: {}
  }
})

// 发送消息的函数
const sendMessage = (e) => {
  // 如果按下 Shift + Enter，则不发送消息
  if (e.shiftKey && e.keyCode === 13) {
    return
  }
  e.preventDefault()

  // 获取消息内容并去除换行符
  const messageContent = msgContent.value ? msgContent.value.replace(/[\r\n]/g, '') : ''
  if (!messageContent) {
    showSendMsgPopover.value = true
    return
  }
  // 调用发送消息的函数
  sendMessageDo({ messageContent, messageType: 2 }, true)
}

// 发送消息的具体实现函数
const sendMessageDo = async (
  messageObj = {
    messageContent,
    messageType,
    localFilePath,
    fileSize,
    fileName,
    filePath,
    fileType
  },
  cleanMsgContent
) => {
  if (!checkFileSize(messageObj.fileType, messageObj.fileSize, messageObj.fileName)) {
    return
  }

  // 判断文件大小
  if (messageObj.fileSize == 0) {
    proxy.Confirm({
      message: `${messageObj.fileName}是一个空文件无法选择,请重新选择`,
      showCancelBtn: false
    })
    return
  }
  // 设置消息的会话 ID 和发送用户 ID
  messageObj.sessionId = props.currentChatSession.sessionId
  messageObj.sendUserId = userInfoStore.getInfo().sendUserId
  // 请求服务器发送消息
  let result = await proxy.Request({
    url: proxy.Api.sendMessage,
    showLoading: false,
    params: {
      messageContent: messageObj.messageContent,
      contactId: props.currentChatSession.contactId,
      messageType: messageObj.messageType,
      fileSize: messageObj.fileSize,
      fileName: messageObj.fileName,
      fileType: messageObj.fileType
    },
    showError: false,
    errorCallback: (responseData) => {
      proxy.Confirm({
        message: responseData.info,
        okfun: () => {
          addContact(props.currentChatSession.contactId, responseData.code)
        },
        okText: '重新申请'
      })
    }
  })
  if (!result) {
    return
  }
  // 更新本地消息
  if (cleanMsgContent) {
    msgContent.value = ''
  }
  Object.assign(messageObj, result.data)
  // 更新列表
  emit('sendMessage4Local', messageObj)
  // 保存消息到本地
  window.ipcRenderer.send('addLocalMessage', messageObj)
}

// 定义一个响应式引用，用于上传文件的引用
const uploadRef = ref()

// 定义一个函数，用于处理文件上传
const uploadFile = (file) => {
  // 调用上传文件的具体实现函数，并传入文件对象
  uploadFileDo(file.file)
  // 清空上传文件的引用
  uploadRef.value.clearFiles()
}

// 定义一个函数，用于具体实现文件上传
const uploadFileDo = (file) => {
  // 获取文件类型
  const fileType = getFileTypeByName(file.name)
  sendMessageDo(
    {
      messageContent: '[' + getFileType(fileType) + ']',
      messageType: 5,
      fileSize: file.size,
      fileName: file.name,
      filePath: file.path,
      fileType: fileType
    },
    false
  )
}

// 定义一个函数，根据文件名获取文件类型
const getFileTypeByName = (fileName) => {
  // 获取文件后缀名
  const fileSuffix = fileName.substr(fileName.lastIndexOf('.') + 1)
  // 根据文件后缀名获取文件类型
  return getFileType(fileSuffix)
}

// 添加好友的引用
const searchAddRef = ref()

// 添加好友的函数
const addContact = (contactId, code) => {
  searchAddRef.value.show({
    contactId,
    contactType: code == 902 ? 'USER' : 'GROUP'
  })
}

//表情相关
const sendEmoji = (emoji) => {
  msgContent.value = msgContent.value + emoji
  showEmojiPopover.value = false
}

const showEmojiPopoverHandler = () => {
  showEmojiPopover.value = true
}

const showSendMsgPopover = ref(false)
const showEmojiPopover = ref(false)

const hidePopover = () => {
  showSendMsgPopover.value = false
  showEmojiPopover.value = false
}
const openPopover = () => {
  document.addEventListener('click', hidePopover, false)
}
const closePopover = () => {
  document.removeEventListener('click', hidePopover, false)
}

//校验文件大小
const checkFileSize = (fileType, fileSize, fileName) => {
  const SIZE_MB = 30 * 1024 * 1024
  const settingArray = Object.values(sysSettingStore.getSetting())
  //图片
  if (fileSize > settingArray[fileType] * SIZE_MB) {
    proxy.Confirm({
      message: `文件${fileName}超过大小${settingArray[fileType]}MB限制`,
      showCancelBtn: false
    })
    return false
  }
  return true
}

//校验文件发送数量
const fileLimit = 10
const checkFileLimit = (files) => {
  if (files.length > fileLimit) {
    proxy.Confirm({
      message: `一次最多可以上传10个文件`,
      showCancelBtn: false
    })
    return
  }
  return true
}

//拖入文件
const dragOverHandler = (e) => {
  e.preventDefault()
}

const dropHandler = (e) => {
  e.preventDefault()
  const files = e.dataTransfer.files
  if (!checkFileLimit(files)) {
    return
  }
  for (let i = 0; i < files.length; i++) {
    uploadFileDo(files[i])
  }
}

// 截图粘贴上传文件
const pasteFile = async (event) => {
  // 获取剪贴板中的项目
  let items = event.clipboardData && event.clipboardData.items
  // 创建一个对象来存储文件数据
  const fileData = {}
  // 遍历剪贴板中的项目
  for (const item of items) {
    // 如果项目不是文件类型，则跳过
    if (item.kind != 'file') {
      break
    }
    // 获取文件对象
    const file = await item.getAsFile()
    // 如果文件路径不为空，直接上传文件
    if (file.path != '') {
      uploadFileDo(file)
    } else {
      // 否则，将文件转换为临时图片文件
      const imageFile = new File([file], 'temp.jpg')
      // 创建一个 FileReader 对象
      let fileReader = new FileReader()
      // 当文件读取完成后执行的函数
      fileReader.onloadend = function () {
        // 读取完成后获得结果
        const byteArray = new Uint8Array(this.result)
        // 将结果存储到 fileData 对象中
        fileData.byteArray = byteArray
        fileData.name = imageFile.name
        // 通过 ipcRenderer 发送文件数据到主进程
        window.ipcRenderer.send('saveClipBoardFile', fileData)
      }
      // 以 ArrayBuffer 格式读取文件
      fileReader.readAsArrayBuffer(imageFile)
    }
  }
}

onMounted(() => {
  window.ipcRenderer.on('saveClipBoardFileCallback', (e, file) => {
    const fileType = 0
    sendMessageDo(
      {
        messageContent: '[' + getFileType(fileType) + ']',
        messageType: 5,
        fileSize: file.size,
        fileName: file.name,
        filePath: file.path,
        fileType: fileType
      },
      false
    )
  })
})
onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('saveClipBoardFileCallback')
})
</script>

<template>
  <div class="send-panel">
    <div class="toolbar">
      <!-- 表情 -->
      <el-popover
        :visible="showEmojiPopover"
        trigger="click"
        placement="top"
        :teleported="false"
        @show="openPopover"
        @hide="closePopover"
        :popper-style="{
          padding: '0px 10px 10px 10px',
          width: '490px'
        }"
      >
        <template #default>
          <el-tabs v-model="activeEmoji" @click.stop>
            <el-tab-pane :label="emoji.name" :name="emoji.name" v-for="emoji in emojiList">
              <div class="emoji-list">
                <div class="emoji-item" v-for="item in emoji.emojiList" @click="sendEmoji(item)">
                  {{ item }}
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
        <template #reference>
          <div class="iconfont icon-emoji" @click="showEmojiPopoverHandler"></div>
        </template>
      </el-popover>
      <!-- 上传组件 -->
      <el-upload
        ref="uploadRef"
        name="file"
        :show-file-list="false"
        :multiple="true"
        :limit="fileLimit"
        :http-request="uploadFile"
        :on-exceed="uploadExceed"
      >
        <div class="iconfont icon-folder"></div>
      </el-upload>
    </div>
    <!-- 输入框 -->
    <div class="input-area" @drop="dropHandler" @dragover="dragOverHandler">
      <el-input
        rows="5"
        v-model="msgContent"
        type="textarea"
        resize="none"
        maxlength="500"
        show-word-limit
        spellcheck="false"
        input-style="background:#f5f5f5;border:none;"
        @keydown.enter="sendMessage"
        @paste="pasteFile"
      />
    </div>
    <!-- 提交按钮 -->
    <div class="send-btn-panel">
      <el-popover
        trigger="click"
        :visible="showSendMsgPopover"
        :hide-after="1500"
        placement="top-end"
        :teleported="false"
        @show="openPopover"
        @hide="closePopover"
        :popper-style="{
          padding: '5px',
          'min-width': '0px',
          width: '120px'
        }"
      >
        <template #default> <span class="empty-msg">不能发送空白信息</span> </template>
        <template #reference>
          <span class="send-btn" @click="sendMessage">发送(S)</span>
        </template>
      </el-popover>
    </div>

    <!--添加好友-->
    <SearchAdd ref="searchAddRef"></SearchAdd>
  </div>
</template>

<style lang="scss" scoped>
.emoji-list {
  .emoji-item {
    float: left;
    font-size: 23px;
    padding: 2px;
    text-align: center;
    border-radius: 3px;
    margin-left: 10px;
    margin-top: 5px;
    cursor: pointer;
    &:hover {
      background: #ddd;
    }
  }
}
.send-panel {
  height: 200px;
  border-top: 1px solid #ddd;
  .toolbar {
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    .iconfont {
      color: #494949;
      font-size: 20px;
      margin-left: 10px;
      cursor: pointer;
    }
    :deep(.el-tabs__header) {
      margin-bottom: 0px;
    }
  }
  .input-area {
    padding: 0px 10px;
    outline: none;
    width: 100%;
    height: 115px;
    overflow: auto;
    word-wrap: break-word;
    word-break: break-all;

    :deep(.el-textarea__inner) {
      box-shadow: none;
    }
    :deep(.el-input__count) {
      background: none;
      right: 12px;
    }
  }
  .send-btn-panel {
    text-align: right;
    padding-top: 10px;
    margin-right: 22px;
    .send-btn {
      cursor: pointer;
      color: #07c160;
      background: #e9e9e9;
      border-radius: 5px;
      padding: 8px 25px;
      &:hover {
        background: #d2d2d2;
      }
    }
    .empty-msg {
      font-size: 13px;
    }
  }
}
</style>
