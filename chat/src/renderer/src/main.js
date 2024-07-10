import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import '@/assets/cust-elementplus.scss'
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
import router from '@/router'
import utils from '@/utils/utils.js'
import verify from '@/utils/verify.js'
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.config.globalProperties.utils = utils
app.config.globalProperties.verify = verify
app.mount('#app')
