<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStateStore } from '@/stores/ContactStateStore'
const { proxy } = getCurrentInstance()
const userInfoStore = useUserInfoStore()
const contactStateStore = useContactStateStore()
// 获取当前路由和路由器实例
const route = useRoute()
const router = useRouter()

// 初始化分页参数
let pageNo = 0
let pageTotal = 1

// 定义一个响应式引用来存储申请列表
const applyList = ref([])

// 定义一个异步函数来加载申请数据
const loadApply = async () => {
  // 增加页码
  pageNo++

  // 如果当前页码超过总页数，则返回
  if (pageNo > pageTotal) {
    return
  }

  // 发送请求获取申请数据
  let result = await proxy.Request({
    url: proxy.Api.loadApply,
    params: {}
  })

  // 如果请求失败，则返回
  if (!result) {
    return
  }

  // 更新总页数
  pageTotal = result.data.pageTotal

  // 如果是第一页，则清空申请列表
  if (result.data.pageNo == 1) {
    applyList.value = []
  }

  // 将新数据合并到申请列表中
  applyList.value = applyList.value.concat(result.data.list)

  // 更新当前页码
  pageNo = result.data.pageNo
}

const dealWithApply = (applyId, contactType, status) => {
  contactStateStore.setContactReload(null)
  proxy.Confirm({
    message: '确定要执行操作吗',
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.dealWithApply,
        params: {
          applyId,
          status
        }
      })
      if (!result) {
        return
      }
      ;(pageNo = 0), loadApply()
      if (contactType == 0 && status == 1) {
        contactStateStore.setContactReload('USER')
      } else if (contactType == 1 && status == 1) {
        contactStateStore.setContactReload('GROUP')
      }
    }
  })
}
//TODO监听新朋友数量改变
// 在组件挂载时调用加载申请数据的函数
onMounted(() => {
  loadApply()
})
</script>

<template>
  <ContentPanel :showTopBorder="true" :infinite-scroll-immediate="false" v-infinite-scroll="loadApply">
    <!-- 遍历 applyList 中的每一项，生成申请项 -->
    <div class="apply-item" v-for="item in applyList" :key="item.applyUserId">
      <!-- 根据 contactType 设置不同的类名 -->
      <div :class="['contact-type', item.contactType == 0 ? 'user-contact' : '']">
        <!-- 根据 contactType 显示不同的文本 -->
        {{ item.contactType == 0 ? '好友' : '群聊' }}
      </div>
      <!-- 显示头像组件 -->
      <Avatar :width="50" :userId="item.applyUserId"></Avatar>
      <div class="contact-info">
        <!-- 显示联系人名称 -->
        <div class="nick-name">{{ item.contactName }}</div>
        <!-- 显示申请信息 -->
        <div class="apply-info">{{ item.applyInfo }}</div>
        <div class="op-btn">
          <div v-if="item.status === 0">
            <el-dropdown placement="bottom-end" trigger="click">
              <span class="el-dropdown-link">
                <el-button type="primary" size="small">接受</el-button>
              </span>
              <template #dropdown>
                <el-dropdown-item @click="dealWithApply(item.applyId, item.contactType, 1)"> 同意 </el-dropdown-item>
                <el-dropdown-item @click="dealWithApply(item.applyId, item.contactType, 2)"> 拒绝 </el-dropdown-item>
                <el-dropdown-item @click="dealWithApply(item.applyId, item.contactType, 3)"> 拉黑 </el-dropdown-item>
              </template>
            </el-dropdown>
          </div>
          <div v-else class="result-name">{{ item.statusName }}</div>
        </div>
      </div>
    </div>
    <div v-if="applyList.length == 0" class="no-data">暂无申请</div>
  </ContentPanel>
</template>

<style lang="scss" scoped>
.apply-item {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中对齐 */
  border-bottom: 1px solid #ddd; /* 底部边框 */
  padding: 10px 0px; /* 内边距 */
}

.contact-type {
  display: flex; /* 使用 flex 布局 */
  justify-content: center; /* 水平居中对齐 */
  writing-mode: vertical-rl; /* 垂直书写模式 */
  vertical-align: middle; /* 垂直居中对齐 */
  background: #2cb6fe; /* 背景颜色 */
  color: #fff; /* 字体颜色 */
  border-radius: 5px 0px 0px 5px; /* 圆角 */
  height: 50px; /* 高度 */
}

.user-contact {
  background: #08bf61; /* 好友的背景颜色 */
}

.contact-info {
  width: 260px; /* 宽度 */
  margin-left: 10px; /* 左边距 */
}

.nick-name {
  color: #000000; /* 昵称的字体颜色 */
}

.apply-info {
  color: #999999; /* 申请信息的字体颜色 */
  font-size: 12px; /* 字体大小 */
  margin-top: 5px; /* 上边距 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 文本溢出显示省略号 */
  white-space: nowrap; /* 禁止换行 */
}
.op-btn {
  width: 50px; /* 设置按钮的宽度 */
  text-align: center; /* 文本居中对齐 */
}

.result-name {
  color: #999999; /* 设置结果名称的字体颜色 */
  font-size: 12px; /* 设置字体大小 */
}
</style>
