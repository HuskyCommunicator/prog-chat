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
              component: () => import('@/views/contact/contactNotice.vue')
            }
          ]
        },
        {
          path: '/setting',
          name: '设置页面',
          component: () => import('@/views/setting/Setting.vue')
        }
      ]
    }
  ]
})
export default router
