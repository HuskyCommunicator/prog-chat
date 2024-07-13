<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'

import Layout from '../../components/Layout.vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const { proxy } = getCurrentInstance()
const searchKey = ref('')
const search = () => {}
const partList = ref([
  {
    partName: '新朋友',
    children: [
      {
        name: '搜好友',
        icon: 'icon-search',
        iconBgColor: '#fa9d3b',
        path: '/contact/search'
      },
      {
        name: '新的朋友',
        icon: 'icon-plane',
        iconBgColor: '#08bf61',
        path: '/contact/contactNotice',
        showTitle: true,
        countKey: 'contactApplyCount'
      }
    ]
  },
  {
    partName: '我的群聊',
    children: [
      {
        name: '新建群聊',
        icon: 'icon-add-group',
        iconBgColor: '#1485ee',
        path: '/contact/createGroup'
      }
    ],
    contactId: 'groupId',
    contactName: 'groupName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail'
  },
  {
    partName: '我加入的群聊',
    contactId: 'contactId',
    contactName: 'contactName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail',
    emptyMsg: '暂未加入群聊'
  },
  {
    partName: '我的好友',
    children: [],
    contactId: 'contactId',
    contactName: 'contactName',
    contactData: [],
    contactPath: '/contact/userDetail',
    emptyMsg: '暂无好友'
  }
])
const rightTitle = ref('')
const partJump = (data) => {
  if (data.showTitle) {
    rightTitle.value = data.name
  } else {
    rightTitle.value = null
  }
  //处理消息已读
  router.push(data.path)
}
</script>

<template>
  <Layout>
    <!-- 左侧内容 -->
    <template #left-content>
      <div class="drag-panel drag"></div>
      <!-- 搜索框 -->
      <div class="top-search">
        <el-input clearable placeholder="搜索内容" v-model="searchKey" size="small" @keyup="search">
          <template #suffix>
            <span class="iconfont icon-search"></span>
          </template>
        </el-input>
      </div>
      <!-- 联系人列表 -->
      <div class="contact-list">
        <template v-for="item in partList">
          <div class="part-title">{{ item.partName }}</div>
          <div class="part-list">
            <div
              v-for="sub in item.children"
              :class="['part-item', sub.path == route.path ? 'active' : '']"
              @click="partJump(sub)"
            >
              <div :class="['iconfont', sub.icon]" :style="{ background: sub.iconBgColor }"></div>
              <div class="text">{{ sub.name }}</div>
            </div>
            <!-- 从接口获取数据 -->
            <template v-for="contact in contactData"> </template>
            <template v-if="item.contactData && item.contactData.length == 0">
              <div class="no-data">{{ item.emptyMsg }}</div>
            </template>
          </div>
        </template>
      </div>
    </template>
    <!-- 右侧内容 -->
    <template #right-content>
      <div class="title-panel drag">{{ rightTitle }}</div>
      <router-view v-slot="{ Component }">
        <component :is="Component" ref="componentRef"></component>
      </router-view>
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

.contact-list {
  border-top: 1px solid #ddd;
  height: calc(100vh - 62px);
  overflow: hidden;
}

.contact-list:hover {
  overflow: auto;
}

.part-title {
  color: #515151;
  padding-left: 10px;
  margin-top: 10px;
}

.part-list {
  border-bottom: 1px solid #d6d6d6;
}

.part-item {
  display: flex;
  align-items: center;
  padding: 10px 10px;
  position: relative;
}

.part-item:hover {
  cursor: pointer;
  background: #d6d6d7;
}

.iconfont {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.text {
  flex: 1;
  color: #000000;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-panel {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 18px;
  color: #000000;
}
.iconfont {
  font-size: 12px;
  color: black;
}
</style>
