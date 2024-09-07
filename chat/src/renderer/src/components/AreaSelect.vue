<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue' // 导入 Vue 的相关模块
const { proxy } = getCurrentInstance() // 获取当前实例的代理对象
import AreaData from './AreaData' // 导入区域数据模块

// 定义组件的属性
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}) // 默认值为空对象
  }
})

// 定义引用和事件
const areaSelectRef = ref() // 定义一个引用，用于引用级联选择器组件
const emit = defineEmits(['update:modelValue']) // 定义一个事件，用于触发 update:modelValue 事件

// 定义 change 方法
const change = (e) => {
  const areaData = {
    areaName: [], // 初始化区域名称数组
    areaCode: [] // 初始化区域代码数组
  }
  const checkedNodes = areaSelectRef.value.getCheckedNodes()[0] // 获取选中的节点
  if (!checkedNodes) {
    // 如果没有选中的节点
    emit('update:modelValue', areaData) // 触发 update:modelValue 事件，并传递空的 areaData
    return
  }
  const pathValues = checkedNodes.pathValues // 提取选中节点的路径值
  const pathLabels = checkedNodes.pathLabels // 提取选中节点的路径标签
  areaData.areaName = pathLabels // 将路径标签赋值给 areaData 的 areaName
  areaData.areaCode = pathValues // 将路径值赋值给 areaData 的 areaCode
  emit('update:modelValue', areaData) // 触发 update:modelValue 事件，并传递更新后的 areaData
}
</script>

<template>
  <div>
    <el-cascader :options="AreaData" v-model="modelValue.areaCode" @change="change" ref="areaSelectRef" clearable></el-cascader>
  </div>
</template>

<style lang="scss" scoped></style>
