<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GroupEditDialog from './GroupEditDialog.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStateStore } from '@/stores/ContactStateStore'

// 获取用户信息存储
const userInfoStore = useUserInfoStore()

// 获取联系人状态存储
const contactStateStore = useContactStateStore()

// 路由相关
const route = useRoute()
const router = useRouter()

// 获取当前实例
const { proxy } = getCurrentInstance()

// 群组信息
const groupInfo = ref({})

// 群组ID
const groupId = ref()

// 获取群组信息的异步函数
const getGroupInfo = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getGroupInfo,
    params: {
      groupId: groupId.value
    }
  })
  if (!result) {
    return
  }
  groupInfo.value = result.data
}

// 监听路由参数变化
watch(
  () => route.query.contactId,
  (newVal, oldVal) => {
    if (newVal) {
      groupId.value = newVal
      getGroupInfo()
    }
  },
  {
    immediate: true,
    deep: true
  }
)

// 群组编辑对话框引用
const groupEditDialogRef = ref()

// 编辑群组信息函数
const editGroupInfo = () => {
  groupEditDialogRef.value.show(groupInfo.value)
}

// 组件挂载时获取群组信息
onMounted(() => {
  if (route.query.contactId) {
    groupId.value = route.query.contactId
    getGroupInfo()
  }
})

const dissolutionGroup = () => {
  proxy.Confirm({
    message: '确定要删除群组?删除后将无法恢复!',
    okfun: async () => {
      // 设置联系人状态重新加载
      contactStateStore.setContactReload(null)

      // 发送解散群组请求
      let result = await proxy.Request({
        url: proxy.Api.dissolutionGroup,
        params: {
          groupId: groupInfo.value.groupId
        }
      })

      // 检查请求结果
      if (!result) {
        return
      }

      // 显示成功消息
      proxy.Message.success('解散成功')

      // 刷新我的群组列表
      contactStateStore.setContactReload('DISSOLUTION_GROUP')
    }
  })
}
const leaveGroup = () => {
  proxy.Confirm({
    message: '确定要退出群组?',
    okfun: async () => {
      // 设置联系人状态重新加载
      contactStateStore.setContactReload(null)

      // 发送退出群组请求
      let result = await proxy.Request({
        url: proxy.Api.leaveGroup,
        params: {
          groupId: groupInfo.value.groupId
        }
      })

      // 检查请求结果
      if (!result) {
        return
      }

      // 显示成功消息
      proxy.Message.success('退出成功')

      // 刷新我的群组列表
      contactStateStore.setContactReload('LEAVE_GROUP')
    }
  })
}
const sendMessage = () => {
  router.push({
    path: '/chat',
    query: {
      chatId: groupInfo.value.groupId,
      timestamp: new Date().getTime()
    }
  })
}
</script>

<template>
  <ContentPanel>
    <div class="group-info-item">
      <div class="group-title">群封面:</div>
      <div class="group-value">
        <Avatar :userId="groupInfo.groupId" />
      </div>
      <!--  -->
      <el-dropdown placement="bottom-end" trigger="click">
        <span class="el-dropdown-link">
          <div class="iconfont icon-more"></div>
        </span>
        <template #dropdown>
          <el-dropdown-menu v-if="groupInfo && groupInfo.groupOwnerId == userInfoStore.getInfo().userId">
            <el-dropdown-item @click="editGroupInfo">修改群信息</el-dropdown-item>
            <el-dropdown-item @click="dissolutionGroup">解散该群</el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu v-else>
            <el-dropdown-item @click="leaveGroup">退出该群</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!--  -->
    <div class="group-info-item">
      <div class="group-title">群ID:</div>
      <div class="group-value">{{ groupInfo.groupId }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title">群名称:</div>
      <div class="group-value">{{ groupInfo.groupName }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title">群成员:</div>
      <div class="group-value">{{ groupInfo.memberCount }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title">加入权限:</div>
      <div class="group-value">
        {{ groupInfo.joinType == 0 ? '直接加入' : '管理员同意后加入' }}
      </div>
    </div>
    <div class="group-info-item notice">
      <div class="group-title">公告:</div>
      <div class="group-value">{{ groupInfo.groupNotice || '_' }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title"></div>
      <div class="group-value">
        <el-button type="primary" @click="sendMessage">发送群消息</el-button>
      </div>
    </div>
  </ContentPanel>
  <GroupEditDialog ref="groupEditDialogRef" @reloadGroupInfo="getGroupInfo"></GroupEditDialog>
</template>

<style lang="scss" scoped>
.group-info-item {
  display: flex;
  margin: 15px 0;
  align-items: center;
}

.group-title {
  width: 100px;
  text-align: right;
}

.group-value {
  flex: 1;
}

.notice {
  align-items: flex-start;
}
</style>
