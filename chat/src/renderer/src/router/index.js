import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  mode: 'hash',
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '默认路径',
      redirect: '/login'
    },
    {
      path: '/login',
      name: '登录',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/showMedia',
      name: '媒体展示',
      component: () => import('@/views/show/ShowMedia.vue')
    },
    {
      path: '/main',
      name: '主页面',
      redirect: '/chat',
      component: () => import('@/views/Main.vue'),
      children: [
        {
          path: '/chat',
          name: '聊天页面',
          component: () => import('@/views/chat/Chat.vue')
        },
        {
          path: '/contact',
          name: '联系人页面',
          redirect: '/contact/blank',
          component: () => import('@/views/contact/Contact.vue'),
          children: [
            {
              path: '/contact/blank',
              name: '空白页面',
              component: () => import('@/views/contact/BlankPage.vue')
            },
            {
              path: '/contact/search',
              name: '搜索页面',
              component: () => import('@/views/contact/Search.vue')
            },
            {
              path: '/contact/createGroup',
              name: '新建群聊',
              component: () => import('@/views/contact/GroupEdit.vue')
            },
            {
              path: '/contact/userDetail',
              name: '用户详情',
              component: () => import('@/views/contact/UserDetail.vue')
            },
            {
              path: '/contact/groupDetail',
              name: '群详情',
              component: () => import('@/views/contact/GroupDetail.vue')
            },
            {
              path: '/contact/contactNotice',
              name: '新的朋友',
              component: () => import('@/views/contact/ContactApply.vue')
            }
          ]
        },
        {
          path: '/setting',
          name: '设置页面',
          redirect: '/setting/userInfo',
          component: () => import('@/views/setting/Setting.vue'),
          children: [
            {
              path: '/setting/userInfo',
              name: '账号设置',
              component: () => import('@/views/setting/UserInfo.vue')
            },
            {
              path: '/setting/fileManage',
              name: '文件管理',
              component: () => import('@/views/setting/FileManage.vue')
            },
            {
              path: '/setting/about',
              name: '关于easyChat',
              component: () => import('@/views/setting/About.vue')
            }
          ]
        }
      ]
    }
  ]
})
export default router
