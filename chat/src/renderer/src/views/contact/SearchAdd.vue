<script setup>
// 从 'vue' 导入必要的函数和对象
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStateStore } from '../../stores/ContactStateStore'

// 初始化联系状态存储
const contactStateStore = useContactStateStore()

// 获取当前实例代理
const { proxy } = getCurrentInstance()

// 初始化用户信息存储
const userInfoStore = useUserInfoStore()

// 初始化表单数据和表单引用
const formData = ref({})
const formDataRef = ref()

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入内容' }]
}

// 对话框配置
const dialogConfig = reactive({
  show: false,
  title: '提交申请',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        submitApply()
      }
    }
  ]
})

// 定义 emit 事件
const emit = defineEmits(['reload'])

// 提交申请函数
const submitApply = async () => {
  const { contactId, contactType, applyInfo } = formData.value
  let result = await proxy.Request({
    url: proxy.Api.applyAdd,
    params: {
      contactId,
      contactType,
      applyInfo
    }
  })
  if (!result) {
    return
  }
  if (result.data == 0) {
    proxy.Message.success('添加成功')
  } else {
    proxy.Message.success('申请成功,等待对方同意')
  }
  dialogConfig.show = false
  emit('reload')
  if (result.data == 0) {
    contactStateStore.setContactReload(contactType)
  }
}

// 显示对话框函数
const show = (data) => {
  dialogConfig.show = true
  const userInfo = userInfoStore.getInfo()
  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = Object.assign({}, data)
    formData.value.applyInfo = '我是' + userInfoStore.getInfo().nickName
  })
}

// 暴露 show 函数
defineExpose({
  show
})
</script>

<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show = false"
    >
      <el-form :model="formData" :rules="rules" ref="formDataRef" @submit.prevent>
        <!--input输入-->
        <el-form-item label="" prop="">
          <el-input
            type="textarea"
            :rows="5"
            clearable
            placeholder="输入申请信息，更容易被通过"
            v-model.trim="formData.applyInfo"
            resize="none"
            show-word-limit
            maxlength="100"
          ></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>
