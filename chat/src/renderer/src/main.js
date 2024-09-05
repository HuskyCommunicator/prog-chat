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
import dialog from '@/components/dialog.vue'
import message from '@/utils/message.js'
import api from '@/utils/api.js'
import confirm from '@/utils/confirm.js'

import layout from '@/components/layout.vue'
import ShowLocalImage from '@/components/ShowLocalImage.vue'
import WinOp from '@/components/WinOp.vue'
import ContentPanel from '@/components/ContentPanel.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarBase from '@/components/AvatarBase.vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(Pinia.createPinia())
app.component('WinOp', WinOp)
app.component('Layout', layout)
app.component('Dialog', dialog)
app.component('ShowLocalImage', ShowLocalImage)
app.component('ContentPanel', ContentPanel)
app.component('Avatar', Avatar)
app.component('AvatarBase', AvatarBase)
app.component('AvatarUpload', AvatarUpload)
app.config.globalProperties.Utils = utils
app.config.globalProperties.Verify = verify
app.config.globalProperties.Request = request
app.config.globalProperties.Message = message
app.config.globalProperties.Api = api
app.config.globalProperties.Confirm = confirm
app.mount('#app')
