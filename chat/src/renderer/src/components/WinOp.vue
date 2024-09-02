<script setup>
// 导入 Vue.js 的相关功能

import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
const { proxy } = getCurrentInstance()
// 定义组件的 props
const props = defineProps({
  showSetTop: {
    type: Boolean,
    default: true
  },
  showMin: {
    type: Boolean,
    default: true
  },
  showMax: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  // 关闭类型 0关闭 1隐藏
  closeType: {
    type: String,
    default: '1'
  }
})

// 定义组件的 emits
const emit = defineEmits(['closeCallback'])

// 定义组件的 reactive properties
const isMax = ref(false)
const isTop = ref(false)

// 定义组件的 methods
const winOp = (action, data) => {
  window.ipcRenderer.send('winTitleOp', { action, data })
}
// 关闭窗口
const close = () => {
  winOp('close', { closeType: props.closeType })
  emit('closeCallback')
}
// 最小化窗口
const minimize = () => {
  winOp('minimize')
}
// 最大化窗口
const maximize = () => {
  if (isMax.value) {
    winOp('unmaximize')
    isMax.value = false
  } else {
    winOp('maximize')
    isMax.value = true
  }
}
// 置顶窗口
const top = () => {
  isTop.value = !isTop.value
  winOp('top', { top: isTop.value })
}

// 在组件挂载后执行的操作
onMounted(() => {
  isMax.value = false
  isTop.value = false
})
</script>

<template>
  <div class="win-op no-drag">
    <!-- 置顶 -->
    <div
      v-if="showSetTop"
      :class="['iconfont icon-top', isTop ? 'win-top' : '']"
      @click="top"
      :title="isTop ? '取消置顶' : '置顶'"
    ></div>
    <!-- 最小化 -->
    <div v-if="showMin" class="iconfont icon-min" @click="minimize" title="最小化"></div>
    <!-- 最大化 -->
    <div
      v-if="showMax"
      :class="['iconfont icon-top', isMax ? 'icon-maximize' : 'icon-max']"
      @click="maximize"
      :title="isMax ? '还原' : '最大化'"
    ></div>
    <!-- 关闭 -->
    <div v-if="showClose" class="iconfont icon-close" @click="close" title="关闭"></div>
  </div>
</template>

<style lang="scss" scoped>
.win-op {
  top: 0px;
  right: 0px;
  position: absolute;
  z-index: 1;
  overflow: hidden;
  border-radius: 0px 3px 0px 0px;
}

.win-op .iconfont {
  float: left;
  font-size: 12px;
  color: #101010;
  text-align: center;
  display: flex;
  justify-content: center;
  cursor: pointer;
  height: 25px;
  align-items: center;
  padding: 0px 10px;
}

.win-op .iconfont:hover {
  background: #ddd;
}

.icon-close:hover {
  background: #fb7373;
  color: #fff;
}

.win-top {
  background: #ddd;
  color: #07c160;
}
</style>
