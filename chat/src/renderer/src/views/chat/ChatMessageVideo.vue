<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import ShowLocalImage from '@/components/ShowLocalImage.vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
})
</script>

<template>
  <div>
    <ShowLocalImage :fileId="data.messageId" partType="chat" :fileType="data.fileType" :showPlay="true"></ShowLocalImage>
  </div>
</template>

<style lang="scss" scoped></style>
