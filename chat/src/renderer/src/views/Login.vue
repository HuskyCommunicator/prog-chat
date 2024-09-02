<script setup>
// 导入vue相关的模块
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import md5 from 'js-md5'
import { useUserInfoStore } from '@/stores/UserInfoStore.js'
import { useRouter } from 'vue-router'
import WinOp from '../components/WinOp.vue'
// 获取当前实例的代理对象
const { proxy } = getCurrentInstance()

// 导入用户信息存储模块
const UserInfoStore = useUserInfoStore()
// 导入路由模块
const router = useRouter()
// 存储表单数据
const formData = ref({
  email: '11@qq.com',
  password: '11'
})
// 存储表单数据的引用
const formDataRef = ref()
// 错误消息
const errorMsg = ref('')
// 存储登录状态
const isLogin = ref(true)
// 显示加载状态
const showLoading = ref(false)
// 验证码URL
const checkCodeUrl = ref(null)
// 清空错误消息
const clearVerify = () => {
  errorMsg.value = null
}

// 切换登录状态，并通过ipcRenderer发送消息
const changeOpType = () => {
  window.ipcRenderer.send('loginOrRegister', isLogin.value)
  isLogin.value = !isLogin.value
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = {}
    clearVerify()
  })
}

// 验证方法
const checkValue = (type, value, msg) => {
  if (proxy.Utils.isEmpty(value)) {
    errorMsg.value = msg
    return false
  }
  if (type && !proxy.Verify[type]) {
    errorMsg.value = msg
    return false
  }
  return true
}

//对提交的表单进行验证
const checkInput = () => {
  if (!checkValue('checkEmail', formData.value.email, '邮箱格式不正确')) {
    return
  }
  if (!isLogin.value && !checkValue(null, formData.value.nickName, '请输入昵称')) {
    return
  }
  if (!checkValue('checkPassword', formData.value.password, '密码只能为数字,字母,特殊符号,2-6位')) {
    return
  }
  if (!isLogin.value && formData.value.password != formData.value.rePassword) {
    errorMsg.value = '两次密码输入不一致'
    return
  }
  if (!checkValue(null, formData.value.checkCode, '请输入验证码')) {
    return
  }
}

// 提交表单
const submit = async () => {
  clearVerify()
  checkInput()
  if (errorMsg.value) {
    return
  }
  if (isLogin.value) {
    showLoading.value = true
  }
  let result = await proxy.Request({
    url: isLogin.value ? proxy.Api.login : proxy.Api.register,
    showLogin: isLogin.value ? false : true,
    showError: false,
    params: {
      email: formData.value.email,
      nickName: formData.value.nickName,
      password: isLogin.value ? md5(formData.value.password) : formData.value.password,
      checkCode: formData.value.checkCode,
      checkCodeKey: localStorage.getItem('checkCodeKey')
    },
    errorCallback: (response) => {
      showLoading.value = false
      changeCheckCode()
      errorMsg.value = response.info
    }
  })
  if (!result) {
    return
  }
  if (isLogin.value) {
    UserInfoStore.setInfo(result.data)
    localStorage.setItem('token', result.data.token)
    router.push('/main')
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    window.ipcRenderer.send('openChat', {
      email: formData.value.email,
      token: result.data.token,
      userId: result.data.userId,
      nickName: result.data.nickName,
      screenWidth: screenWidth,
      screenHeight: screenHeight
    })
  } else {
    proxy.Message.success('注册成功，请登录')
    changeOpType()
  }
}

// 更改验证码
const changeCheckCode = async () => {
  let result = await proxy.Request({
    url: proxy.Api.checkCode
  })
  if (!result) {
    return
  }
  checkCodeUrl.value = result.data.checkCode
  localStorage.setItem('checkCodeKey', result.data.checkCodeKey)
}

// 生命周期钩子
onMounted(() => {
  changeCheckCode()
})
</script>

<template>
  <div class="login-panel">
    <!-- 标题 -->
    <div class="title drag">Easy Chat</div>
    <div v-if="showLoading" class="loading-panel">
      <img src="@/assets/img/loading.gif" alt="" />
    </div>
    <div class="login-form" v-else>
      <!-- 错误消息 -->
      <div class="error-msg">{{ errorMsg }}</div>
      <!-- 表单 -->
      <el-form :model="formData" ref="formDataRef" @submit.prevent label-width="0px">
        <!--邮箱-->
        <el-form-item prop="email">
          <el-input
            size="large"
            clearable
            placeholder="请输入邮箱"
            v-model.trim="formData.email"
            maxlength="30"
            @focus="clearVerify"
          >
            <template #prefix>
              <span class="iconfont icon-email"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 昵称 -->
        <el-form-item prop="nickName" v-if="!isLogin">
          <el-input
            size="large"
            clearable
            placeholder="请输入昵称"
            v-model.trim="formData.nickName"
            @focus="clearVerify"
          >
            <template #prefix>
              <span class="iconfont icon-user-nick"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            size="large"
            clearable
            placeholder="请输入密码"
            v-model.trim="formData.password"
            show-password
            @focus="clearVerify"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 再次输入密码 -->
        <el-form-item prop="rePassword" v-if="!isLogin">
          <el-input
            size="large"
            clearable
            placeholder="请再次输入密码"
            v-model.trim="formData.rePassword"
            show-password
            @focus="clearVerify"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 验证码 -->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              clearable
              placeholder="请输入验证码"
              v-model.trim="formData.checkCode"
              @focus="clearVerify"
            >
              <template #prefix>
                <span class="iconfont icon-checkCode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode" />
          </div>
        </el-form-item>
        <!-- 提交 -->
        <el-form-item>
          <el-button type="primary" @click="submit" class="login-btn">
            {{ isLogin ? '登录' : '注册' }}</el-button
          >
        </el-form-item>
        <div class="button-link">
          <span class="a-link" @click="changeOpType">
            {{ isLogin ? '没有账号?' : '已有账号?' }}
          </span>
        </div>
      </el-form>
    </div>
  </div>
  <!-- 窗口组件 -->
  <WinOp :showSetIop="false" :showMin="false" :showMax="false" :closeType="0"></WinOp>
</template>

<style lang="scss" scoped>
.email-select {
  width: 250px;
}

.loading-panel {
  height: calc(100vh - 32px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    width: 300px;
  }
}

.login-panel {
  background: #fff;
  border-radius: 3px;
  border: 1px solid #ddd;

  .title {
    height: 30px;
    padding: 5px 0px 0px 10px;
  }

  .login-form {
    padding: 0px 15px 29px 15px;

    :deep(.el-input-wrapper) {
      box-shadow: none;
      border-radius: none;
    }

    .el-form-item {
      border-bottom: 1px solid #ddd;
    }

    .email-panel {
      align-items: center;
      width: 100%;
      display: flex;

      .input {
        flex: 1;

        .icon-down {
          margin-left: 3px;
          width: 16px;
          cursor: pointer;
          border: none;
        }
      }
    }

    .error-msg {
      line-height: 30px;
      height: 30px;
      color: #fb7373;
    }

    .check-code-panel {
      display: flex;

      .check-code {
        cursor: pointer;
        width: 120px;
        margin-left: 5px;
      }
    }

    .login-btn {
      margin-top: 20px;
      width: 100%;
      background: #07c160;
      height: 36px;
      font-size: 16px;
    }

    .bottom-link {
      text-align: right;
    }
  }
}
</style>
