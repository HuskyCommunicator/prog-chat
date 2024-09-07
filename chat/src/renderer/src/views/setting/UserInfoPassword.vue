<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref()
const validateRePass = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

const rules = {
  password: [
    { required: true, message: '请输入新密码' },
    { validator: proxy.Verify.password, message: '密码只能是数字、字母、特殊字符8~18位' }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码' },
    { validator: validateRePass, message: '两次输入的密码不一致' }
  ]
}

const emit = defineEmits(['editBack']) // 定义事件
const saveUserInfo = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    proxy.Confirm({
      message: '修改密码后，需要重新登陆，确认修改吗？',
      okfun: async () => {
        let params = {}
        Object.assign(params, formData.value)
        let result = await proxy.Request({
          url: proxy.Api.updatePassword,
          params
        })
        if (!result) {
          return
        }
      }
    })
    proxy.Message.success('修改成功,请重新登陆', () => {
      //TODO 重新登陆
      window.ipcRenderer.send('reLogin')
    })
  })
}
const cancel = () => {
  emit('editBack')
}
</script>

<template>
  <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
    <!--  -->
    <el-form-item label="密码" prop="password">
      <el-input clearable placeholder="请输入新密码" v-model.trim="formData.password" show-password></el-input>
    </el-form-item>
    <!--  -->
    <el-form-item label="确认密码" prop="rePassword">
      <el-input type="password" clearable placeholder="请再次输入新密码" v-model.trim="formData.rePassword" show-password></el-input>
    </el-form-item>
    <!-- 按钮 -->
    <el-form-item>
      <el-button type="primary" @click="saveUserInfo">修改密码</el-button>
      <el-button type="info" @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>
