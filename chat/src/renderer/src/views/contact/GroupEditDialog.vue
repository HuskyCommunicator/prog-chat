<script setup>
import { ref, reactive, getCurrentInstance, nextTick, defineExpose } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GroupEditForm from './GroupEditForm.vue'

// 获取当前实例
const { proxy } = getCurrentInstance()

// 路由相关
const route = useRoute()
const router = useRouter()

// 对话框配置
const dialogConfig = ref({
  show: false,
  title: '编辑群组',
  buttons: []
})

// 群组编辑表单引用
const groupEditRef = ref(null)

// 显示对话框函数
// const show = (data) => {
//   if (groupEditRef.value && typeof groupEditRef.value.show === 'function') {
//     nextTick(() => {
//       groupEditRef.value.show(data)
//     })
//   } else {
//     console.error('groupEditRef is not defined.')
//   }
//   dialogConfig.value.show = true
// }
const show = (data) => {
  dialogConfig.value.show = true
  nextTick(() => {
    groupEditRef.value.show(data)
  })
}

// 定义事件发射器
const emit = defineEmits(['reloadGroupInfo'])

// 编辑完成后的回调函数
const editBack = () => {
  dialogConfig.value.show = false
  emit('reloadGroupInfo')
}

// 暴露 show 方法给父组件
defineExpose({ show })
</script>

<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <GroupEditForm ref="groupEditRef" @editBack="editBack"></GroupEditForm>
  </Dialog>
</template>

<style lang="scss" scoped></style>
