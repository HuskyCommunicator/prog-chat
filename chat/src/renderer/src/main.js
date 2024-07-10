import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import '@/assets/cust-elementplus.scss'
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
import * as Pinia from 'pinia'
import router from '@/router'
import utils from '@/utils/utils.js'
import verify from '@/utils/verify.js'
import request from '@/utils/request.js'
// import request from './utils/request.js'
import message from '@/utils/message.js'
import api from '@/utils/api.js'
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(Pinia.createPinia())
app.config.globalProperties.Utils = utils
app.config.globalProperties.Verify = verify
app.config.globalProperties.Request = request
app.config.globalProperties.Message = message
app.config.globalProperties.Api = api
app.mount('#app')
