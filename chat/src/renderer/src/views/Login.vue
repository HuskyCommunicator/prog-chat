<script setup>
// 导入vue相关的模块
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'

// 获取当前实例的代理对象
const { proxy } = getCurrentInstance()

// 存储表单数据
const formData = ref({
  email: '123@qq.com',
  password: '123'
})

// 存储表单数据的引用
const formDataRef = ref()

// 错误消息
const errorMsg = ref('')

// 存储登录状态
const isLogin = ref(true)

// 切换登录状态，并通过ipcRenderer发送消息
const changeOpType = () => {
  // 使用ipcRenderer发送'loginOrRegister'消息，消息的内容是当前的登录状态
  window.ipcRenderer.send('loginOrRegister', isLogin.value)
  // 切换登录状态
  isLogin.value = !isLogin.value
  // 切换登录状态后，清空表单数据
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = {}
    cleanVerify()
  })
}

// 提交表单
const submit = async () => {
  // 清空验证错误
  clearVerify()
  // 验证邮箱格式
  if (!checkValue('checkEmail', formData.value.email, '邮箱格式不正确')) {
    return
  }
  //验证昵称
  if (!isLogin.value && !checkValue(null, formData.value.nickName, '请输入昵称')) {
    return
  }
  // 验证密码格式
  if (!checkValue('checkPassword', formData.value.password, '密码只能为数字,字母,特殊符号,2-6位')) {
    return
  }
  //验证密码是否相等
  if (!isLogin.value && formData.value.password != formData.value.rePassword) {
    errorMsg.value = '两次密码输入不一致'
    return
  }
  // 验证验证码是否输入
  if (!checkValue(null, formData.value.checkCode, '请输入验证码')) {
    return
  }
}

// 验证方法
const checkValue = (type, value, msg) => {
  // 如果值为空，设置错误消息并返回false
  if (proxy.utils.isEmpty(value)) {
    errorMsg.value = msg
    return false
  }
  // 如果有验证类型，并且验证失败，设置错误消息并返回false
  if (type && !proxy.verify[type](value)) {
    errorMsg.value = msg
    return false
  }
  // 验证成功，返回true
  return true
}

// 清空错误消息
const clearVerify = () => {
  errorMsg.value = null
}
</script>

<template>
  <div class="login-panel">
    <!-- 标题 -->
    <div class="title drag">Easy Chat</div>
    <div class="login-form">
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
