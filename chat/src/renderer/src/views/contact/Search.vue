<script setup>
// 从 'vue' 导入必要的函数和对象
import { ref, computed, getCurrentInstance } from 'vue'

// 导入用户信息存储
import { useUserInfoStore } from '@/stores/UserInfoStore'

// 初始化用户信息存储
const userInfoStore = useUserInfoStore()

// 获取当前实例代理
const { proxy } = getCurrentInstance()

// 将联系人ID和搜索结果初始化为响应式引用
const contactId = ref('')
const searchResult = ref([])

// 定义一个计算属性来确定内容类型名称
const contentTypeName = computed(() => {
  if (userInfoStore.getInfo().userId == searchResult.value.contactId) {
    return '自己' // '自己'
  } else if (searchResult.value.contactType == 'USER') {
    return '用户' // '用户'
  } else if (searchResult.value.contactType == 'GROUP') {
    return '群组' // '群组'
  }
})

// 定义搜索函数
const search = async () => {
  // 检查是否输入了联系人ID
  if (!contactId.value) {
    proxy.Message.warning('请输入用户id或群组id') // '请输入用户id或群组id'
    return
  }

  // 向搜索API发出请求
  let result = await proxy.Request({
    url: proxy.Api.search,
    params: { contactId: contactId.value }
  })

  // 如果没有结果，返回
  if (!result) {
    return
  }

  // 更新搜索结果
  searchResult.value = result.data
  console.log(result.data)
}
</script>

<template>
  <ContentPanel>
    <!-- 搜索框 -->
    <div class="search-form">
      <el-input
        clearable
        placeholder="请输入用户id或群组id"
        v-model="contactId"
        size="large"
        @keyDown.enter="search"
      ></el-input>
      <div class="search-btn iconfont icon-search" @click="search"></div>
    </div>
    <!-- 搜索结果 -->
    <div v-if="searchResult && Object.keys(searchResult).length > 0" class="search-result-panel">
      <!-- 展示结果 -->
      <div class="search-result">
        <span class="contact-type">{{ contentTypeName }}</span>
        <div>{{ searchResult.nickName }}</div>
      </div>
      <div class="op-btn" v-if="searchResult.contactId != userInfoStore.getInfo().userId">
        <el-button
          type="primary"
          @click="applyContact"
          v-if="
            searchResult.status == null ||
            searchResult.status == 0 ||
            searchResult.status == 2 ||
            searchResult.status == 3 ||
            searchResult.status == 4
          "
          >{{ searchResult.contactType == 'USER' ? '添加到联系人' : '申请加入群组' }}</el-button
        >
        <el-button type="primary" v-if="searchResult.status == 1" @click="sendMessage"
          >发消息</el-button
        >
        <span v-if="searchResult.status == 5 || searchResult.status == 6">对方拉黑了你</span>
      </div>
    </div>
    <!-- 结果为空 -->
    <div v-else class="no-data">没有搜到结果</div>
  </ContentPanel>
</template>

<style lang="scss" scoped>
.search-form {
  padding-top: 50px;
  display: flex;
  align-items: center;

  ::v-deep(.el-input__wrapper) {
    border-radius: 4px 0px 0px 4px;
    border-right: none;
  }

  .search-btn {
    background: #07c160;
    color: #fff;
    line-height: 40px;
    width: 80px;
    text-align: center;
    border-radius: 0px 5px 5px 0px;
    cursor: pointer;

    &:hover {
      background: #0dd36c;
    }
  }
}

.no-data {
  padding: 30px 0px;
}

.search-result-panel .search-result {
  padding: 30px 20px 20px 20px;
  background: #fff;
  border-radius: 5px;
  margin-top: 10px;
  position: relative;

  .contact-type {
    position: absolute;
    left: 0px;
    top: 0px;
    background: #2cb6fe;
    padding: 2px 5px;
    color: #fff;
    border-radius: 5px 0px 0px 0px;
    font-size: 12px;
  }
}

.op-btn {
  border-radius: 5px;
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  text-align: center;
}
</style>
