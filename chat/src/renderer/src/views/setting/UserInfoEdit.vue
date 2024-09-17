<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from 'vue' // 导入 Vue 的相关模块
import AreaSelect from '@/components/AreaSelect.vue' // 导入区域选择组件
import { useUserInfoStore } from '@/stores/UserInfoStore'
const userInfoStore = useUserInfoStore()
const { proxy } = getCurrentInstance() // 获取当前实例的代理对象
import { useAvatarUpdateStore } from '@/stores/AvatarUpdateStore'
const avatarUpdateStore = useAvatarUpdateStore()
// 定义组件的属性
const props = defineProps({
  data: {
    type: Object
  }
})

// 计算属性，用于处理用户信息
const formData = computed(() => {
  const userInfo = props.data // 复制 props.data 到 userInfo
  userInfo.avatarFile = userInfo.userId // 将 userId 赋值给 avatarFile
  userInfo.area = {
    areaCode: userInfo.areaCode ? userInfo.areaCode.split(',') : [], // 将 areaCode 字符串拆分为数组
    areaName: userInfo.areaName ? userInfo.areaName.split(',') : [] // 将 areaName 字符串拆分为数组
  }
  return userInfo
})
const emit = defineEmits(['editBack']) // 定义事件
const formDataRef = ref() // 定义一个引用，用于表单数据

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入内容' }], // 标题字段的验证规则
  // avatarFile: [{ required: true, message: '请上传头像' }], // 头像字段的验证规则（已注释）
  nickName: [{ required: true, message: '请输入昵称' }] // 昵称字段的验证规则
}
const saveCover = ({ avatarFile, coverFile }) => {
  formData.value.avatarFile = avatarFile // 将上传的头像文件赋值给 formData.value.avatarFile
  formData.value.avatarCover = coverFile // 将上传的封面文件赋值给 formData.value.coverFile
}
const saveUserInfo = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value), (params.areaName = ''), (params.areaCode = '')
    if (params.area) {
      params.areaName = params.area.areaName.join(',')
      params.areaCode = params.area.areaCode.join(',')
      delete params.area
    }
    avatarUpdateStore.setForceReload(userInfoStore.getInfo().userId, false)
    let result = await proxy.Request({
      url: proxy.Api.saveUserInfo,
      params
    })
    if (!result) {
      return
    }
    proxy.Message.success('保存成功')
    userInfoStore.setInfo(result.data)
    avatarUpdateStore.setForceReload(userInfoStore.getInfo().userId, true)

    emit('editBack')
  })
}
const cancel = () => {
  emit('editBack')
}
</script>

<template>
  <div>
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
      <!--  -->
      <el-form-item label="头像" prop="avatar">
        <AvatarUpload v-model="formData.avatarFile" @coverFile="saveCover"></AvatarUpload>
      </el-form-item>
      <!--  -->
      <el-form-item label="昵称" prop="nickName">
        <el-input maxlength="150" clearable placeholder="请输入昵称" v-model.trim="formData.nickName"></el-input>
      </el-form-item>
      <!--  -->
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <!--  -->
      <el-form-item label="朋友权限" prop="joinType">
        <el-switch v-model="formData.joinType" :active-value="1" :inactive-value="0" />
        <div class="info">加我为好友时需要验证</div>
      </el-form-item>
      <!--  -->
      <el-form-item label="地区" prop="area"><AreaSelect v-model="formData.area"></AreaSelect></el-form-item>
      <!--  -->
      <el-form-item label="个性签名" prop="personalSignature">
        <el-input
          clearable
          placeholder="请输入个性签名"
          v-model.trim="formData.personalSignature"
          type="textarea"
          :rows="5"
          maxlength="30"
          :show-word-limit="true"
          resize="none"
        ></el-input>
      </el-form-item>
      <!--  -->
      <el-form-item>
        <el-button type="primary" @click="saveUserInfo">保存个人信息</el-button>
        <el-button type="link" @click="cancel">取消</el-button>
      </el-form-item>
      <!--  -->
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.info {
  margin-left: 5px;
  color: #949494;
  font-size: 12px;
}
</style>
