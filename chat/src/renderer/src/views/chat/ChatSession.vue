<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import AvatarBase from '@/components/AvatarBase.vue'
// import formatDate from '@/utils/utils.js'
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Object,
    default: {} // 使用函数返回对象
  },
  currentSession: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div :class="['chat-session-item', currentSession ? 'active' : '']">
    <div class="contact-tag" v-if="data.contact_type == 1">群</div>
    <AvatarBase :userId="data.contact_id" />
    <div class="user-info">
      <div class="user-name-panel">
        <div class="user-name">{{ data.contact_name }}</div>
        <!-- <div class="message-time">{{ formatDate(data.last_receive_time) }}</div> -->
        <div class="message-time">{{ proxy.Utils.formatDate(data.last_receive_time) }}</div>
        <!-- 在直接引用formatDate而不是全局引入时会产生警告而无法运行 -->
      </div>
      <div class="last-message" v-html="data.last_message"></div>
    </div>
    <div class="chat-top iconfont icon-top" v-if="data.top_type == 1"></div>
  </div>
</template>

<style lang="scss" scoped>
.chat-session-item {
  padding: 10px;
  position: relative;
  display: flex;
  border-bottom: 1px solid #ddd;
}

.contact-tag {
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 1;
  background: #24acf2;
  color: #fff;
  font-size: 12px;
  padding: 1px 2px;
  border-radius: 0px 3px 3px 0px;
  line-height: 12px;
}

.contact-tag:hover {
  cursor: pointer;
  background: #d8d8d7;
}

.message-time {
  color: #9a9898 !important;
}

.user-info {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-name-panel {
  display: flex;
}

.user-name {
  //  width: 14px;
  color: #000000;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  width: 55px;
  color: #b6b6b6;
  font-size: 12px;
  text-align: right;
}

.last-message {
  width: 180px;
  height: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #999999;
  margin-top: 5px;
}

.chat-top {
  position: absolute;
  right: 0px;
  top: 0px;
  font-size: 12px;
  color: #8f8f8f;
}

.chat-top.active {
  cursor: pointer;
  background: #c9c8c6;
}

.message-time:hover {
  background: #c9c8c6;
  color: #999999 !important;
}
</style>
