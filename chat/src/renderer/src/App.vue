<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const { proxy } = getCurrentInstance()
const locale = zhCn
const config = reactive({ max: 1 })
</script>
<template>
  <el-config-provider :locale="locale" :message="config">
    <router-view></router-view>
  </el-config-provider>
</template>

<style lang="less"></style>
