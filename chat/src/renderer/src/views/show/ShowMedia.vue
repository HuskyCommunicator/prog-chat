<script setup>
// 导入必要的模块和组件
import DPlayer from 'dplayer' // 导入DPlayer视频播放器模块
import 'viewerjs/dist/viewer.css' // 导入Viewer.js的CSS样式文件
import { component as Viewer } from 'v-viewer' // 从v-viewer中导入Viewer组件
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue' // 从Vue中导入响应式API和生命周期钩子函数

// 获取当前实例的代理
const { proxy } = getCurrentInstance() // 获取当前组件实例的代理对象

// 定义响应式变量
const fileList = ref([{ fileType: 0, status: 0 }]) // 定义一个响应式变量fileList，初始值为一个包含fileType和status属性的对象数组
const currentIndex = ref(0) // 定义一个响应式变量currentIndex，初始值为0
const allFileList = ref([]) // 定义一个响应式变量allFileList，初始值为空数组
const instance = ref(null) // 定义一个响应式变量instance，初始值为null

// 图片展示选项
const options = ref({
  inline: true, // 是否内联显示
  toolbar: false, // 是否显示工具栏
  navbar: false, // 是否显示导航栏
  button: false, // 是否显示按钮
  title: false, // 是否显示标题
  zoomRatio: 0.1, // 缩放比例
  zoomOnWheel: false // 是否允许滚轮缩放
})
const viewerMy = ref(null) // 定义一个响应式变量viewerMy，初始值为null
const inited = (e) => {
  viewerMy.value = e // 初始化时，将传入的参数赋值给viewerMy
}

// 放大缩小
const changeSize = (zoomRatio) => {
  viewerMy.value.zoom(zoomRatio, true) // 调用viewerMy的zoom方法，按指定比例缩放
}

// 旋转
const rotate = () => {
  viewerMy.value.rotate(90, true) // 调用viewerMy的rotate方法，旋转90度
}

// 原始大小
const isOne2One = ref(false) // 定义一个响应式变量isOne2One，初始值为false
const resize = () => {
  isOne2One.value = !isOne2One.value // 切换isOne2One的值
  if (!isOne2One.value) {
    viewerMy.value.zoomTo(viewerMy.value.initialImageData.ratio, true) // 如果isOne2One为false，按初始比例缩放
  } else {
    viewerMy.value.zoomTo(1, true) // 如果isOne2One为true，按1:1比例缩放
  }
}

const localServerPort = ref() // 定义一个响应式变量localServerPort

const getUrl = (curFile) => {
  return `http://localhost:${localServerPort.value}/file?fileId=${curFile.fileId}&partType=${
    curFile.partType
  }&fileType=${curFile.fileType}&forceGet=${curFile.forceGet}&${new Date().getTime()}` // 构建文件URL
}

// 处理滚轮事件
const onWheel = (e) => {
  if (fileList.value[0].fileType !== 0) {
    return // 如果文件类型不是0，直接返回
  }
  if (e.deltaY > 0) {
    changeSize(0.1) // 如果滚轮向下滚动，放大
  } else {
    changeSize(-0.1) // 如果滚轮向上滚动，缩小
  }
}

// 初始化视频播放器
const player = ref() // 定义一个响应式变量player
const dPlayer = ref() // 定义一个响应式变量dPlayer
const initPlayer = () => {
  dPlayer.value = new DPlayer({
    element: player.value, // 视频播放器的DOM元素
    theme: '#b7daff', // 视频播放器的主题颜色
    screenshot: true, // 是否启用截图功能
    video: {
      url: '', // 视频URL
      type: 'auto'
    }
  })
}

const getCurrentFile = () => {
  //如果视频在播放时切换到图片仍会播放,手动判断来暂停
  if (dPlayer.value) {
    dPlayer.value.pause()
  }
  const curFile = allFileList.value[currentIndex.value]
  const url = getUrl(curFile)

  fileList.value.splice(0, 1, {
    url: url,
    fileType: curFile.fileType,
    status: 1,
    fileSize: curFile.fileSize,
    fileName: curFile.fileName
  })
  if (curFile.fileType == 1) {
    dPlayer.value.switchVideo({
      url: url
    })
  }
}
// 关闭窗口
const closeWin = () => {
  dPlayer.value.pause() // 暂停视频播放器
}

//上一个下一个
const next = (index) => {
  if (currentIndex.value + index < 0 || currentIndex.value + index >= allFileList.value.length) {
    return
  }
  currentIndex.value = currentIndex.value + index
  getCurrentFile()
}

//保存文件
const saveAs = () => {
  const curFile = allFileList.value[currentIndex.value]
  window.ipcRenderer.send('saveAs', {
    partType: curFile.partType,
    fileId: curFile.fileId
  })
}

// 组件挂载时的操作
onMounted(() => {
  initPlayer() // 初始化视频播放器

  window.addEventListener('wheel', onWheel) // 添加滚轮事件监听

  window.ipcRenderer.on('pageInitData', (e, data) => {
    localServerPort.value = data.localServerPort // 设置本地服务器端口
    allFileList.value = data.fileList // 设置所有文件列表
    let index = 0
    if (data.currentFileId) {
      index = data.fileList.findIndex((item) => item.fileId === data.currentFileId) // 查找当前文件索引
      index = index == -1 ? 0 : index // 如果未找到，设置索引为0
    }
    currentIndex.value = index // 设置当前索引
    getCurrentFile() // 获取当前文件
  })
})

// 组件卸载时的操作
onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('pageInitData') // 移除所有pageInitData事件监听
  window.removeEventListener('wheel', onWheel) // 移除滚轮事件监听
})
</script>

<template>
  <div class="media-window">
    <div class="win-title drag"></div>
    <div class="media-op no-drag">
      <div :class="['iconfont icon-left', currentIndex == 0 ? 'not-allow' : '']" @dblclick.stop title="上一张" @click="next(-1)"></div>
      <div
        :class="['iconfont icon-right', currentIndex >= allFileList.length - 1 ? 'not-allow' : '']"
        @dblclick.stop
        title="下一张"
        @click="next(1)"
      ></div>
      <!-- 展示图片 -->
      <template v-if="fileList[0].fileType == 0">
        <el-divider direction="vertical" />
        <div class="iconfont icon-enlarge" @click.stop="changeSize(0.1)" @dblclick.stop title="放大"></div>
        <div class="iconfont icon-narrow" @click="changeSize(-0.1)" @dblclick.stop title="缩小"></div>
        <div
          :class="['iconfont', isOne2One ? 'icon-resize' : 'icon-source-size']"
          @dblclick.stop
          @click="resize"
          :title="isOne2One ? '图片适应窗口大小' : '图片原始大小'"
        ></div>
        <div class="iconfont icon-rotate" @dblclick.stop @click="rotate" title="旋转"></div>
        <el-divider direction="vertical" />
      </template>
      <div class="iconfont icon-download" @dblclick.stop @click="saveAs" title="另存为..."></div>
    </div>
    <div class="media-panel">
      <viewer :options="options" @inited="inited" :images="fileList" v-if="fileList[0].fileType == 0 && fileList[0].status == 1">
        <img :src="fileList[0].url" />
      </viewer>
      <div ref="player" id="player" v-show="fileList[0].fileType == 1 && fileList[0].status == 1" style="width: 100%; height: 100%"></div>
      <!-- 展示文件 -->
      <div v-if="fileList[0].fileType == 2" class="file-panel">
        <div class="file-item">文件名：{{ fileList[0].fileName }}</div>
        <div class="file-item">文件大小：{{ Utils.size2Str(fileList[0].fileSize) }}</div>
        <div class="file-item download">
          <el-button type="primary" @click="saveAs">下载文件</el-button>
        </div>
      </div>
      <div class="loading" v-if="fileList[0].status != 1">加载中....</div>
    </div>
  </div>
  <WinOp @closeCallback="closeWin"></WinOp>
</template>

<style lang="scss" scoped>
.media-window {
  padding: 0px;
  height: calc(100vh);
  border: 1px solid #ddd;
  background: #fff;
  position: relative;
  overflow: hidden;
  .win-title {
    height: 37px;
  }
  .media-op {
    position: absolute;
    left: 0px;
    top: 0px;
    height: 35px;
    line-height: 35px;
    display: flex;
    align-items: center;
    .iconfont {
      font-size: 18px;
      padding: 0px 10px;
      &:hover {
        background: #f3f3f3;
        cursor: pointer;
      }
    }
    .not-allow {
      cursor: not-allowed;
      color: #ddd;
      text-decoration: none;
      &:hover {
        color: #ddd;
        cursor: not-allowed;
        background: none;
      }
    }
  }
  .media-panel {
    height: calc(100vh - 37px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    :deep(.viewer-backdrop) {
      background: #f5f5f5;
    }

    .file-panel {
      .file-item {
        margin-top: 5px;
      }
      .download {
        margin-top: 20px;
        text-align: center;
      }
    }
  }
}
</style>
