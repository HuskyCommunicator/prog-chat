<script setup>
import ShowLocalImage from "./ShowLocalImage.vue";
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const { proxy } = getCurrentInstance();
const props = defineProps({
  userId: {
    type: String,
  },
  width: {
    type: Number,
    default: 40,
  },
  borderRadius: {
    type: Number,
    default: 0,
  },
  showDetail: {
    type: Boolean,
    default: false,
  },
});
const showDetailHandler = () => {
  if (!props.showDetail) {
    return;
  }
  //todo 查看图片详情
};
</script>

<template>
  <div
    class="user-avatar"
    @click="showDetailHandler"
    :style="{
      width: width + 'px',
      height: width + 'px',
      'border-radius': borderRadius + 'px',
    }"
  >
    <ShowLocalImage
      :width="width"
      :fileId="userId"
      partType="avatar"
      :forceGet="true"
    ></ShowLocalImage>
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  background: #d3d3d3;
  display: flex;
  overflow: hidden;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
</style>
