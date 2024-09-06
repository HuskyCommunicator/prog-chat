<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'

// 获取当前实例
const { proxy } = getCurrentInstance()

// 引入联系人状态存储
import { useContactStateStore } from '@/stores/ContactStateStore'
const contactStateStore = useContactStateStore()

// 表单数据
const formData = ref({})
const formDataRef = ref()

// 表单验证规则
const rules = {
  groupName: [{ required: true, message: '请输入群名称' }],
  joinType: [{ required: true, message: '请选择加入权限' }]
  // avatarFile: [{ required: true, message: "请选择头像" }],
}

// 定义事件发射器
const emit = defineEmits('editBack')

// 提交表单函数
const submit = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    // TODO: 重新加载头像
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: proxy.Api.saveGroup,
      params
    })
    if (!result) {
      return
    }
    if (params.groupId) {
      proxy.Message.success('修改群组成功')
      emit('editBack')
    } else {
      proxy.Message.success('群组创建成功')
    }
    formDataRef.value.resetFields()

    contactStateStore.setContactReload('MY')
    // TODO: 重新加载头像
  })
}
const show = (data) => {
  // 重置表单字段
  formDataRef.value.resetFields()

  // 复制数据到 formData
  formData.value = Object.assign({}, data)

  // 设置 avatarFile 字段
  formData.value.avatarFile = data.groupId
}
defineExpose({ show })
const saveCover = () => {}
</script>

<template>
  <el-form :model="formData" :rule="rules" ref="formDataRef" label-width="80px" @submit.prevent>
    <!--  -->
    <el-form-item label="群名称" prop="groupName">
      <el-input maxlength="150" clearable placeholder="请输入群名称" v-model.trim="formData.groupName"></el-input>
    </el-form-item>
    <!--  -->
    <el-form-item label="封面" prop="avatarFile">
      <AvatarUpload v-model="formData.avatarFile" ref="avatarUploadRef" @coverFile="saveCover"></AvatarUpload>
    </el-form-item>
    <!--  -->
    <el-form-item label="加入权限" prop="joinType">
      <el-radio-group v-model="formData.joinType">
        <el-radio :label="1">管理员同意后加入</el-radio>
        <el-radio :label="0">直接加入</el-radio>
      </el-radio-group>
    </el-form-item>
    <!--  -->
    <el-form-item label="公告" prop="groupNotice">
      <el-input clearable placeholder="请输入群公告" v-model.trim="formData.groupNotice" type="textarea" rows="5" maxlength="300" :show-word-limit="true" resize="none"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submit">
        {{ formData.groupId ? '修改群组' : '创建群组' }}
      </el-button>
    </el-form-item>

    <!--  -->
  </el-form>
</template>

<style lang="scss" scoped></style>
