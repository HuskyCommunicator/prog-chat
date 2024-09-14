<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: null
  }
})
const localFile = ref(null)
const emit = defineEmits(['coverFile'])
const uploadImage = async (file) => {
  console.log('图像选择完成,向主进程发送消息')
  file = file.file
  window.ipcRenderer.send('createCover', file.path)
}
const preview = computed(() => {
  return props.modelValue instanceof File
})
onMounted(() => {
  window.ipcRenderer.on('createCoverCallback', (e, { avatarStream, coverStream }) => {
    console.log('渲染进程收到缩略图消息')

    const coverBlob = new Blob([coverStream], { type: 'image/png' })
    const coverFile = new File([coverBlob], 'thumbnail.jpg')

    let img = new FileReader()
    img.readAsDataURL(coverFile)
    img.onload = ({ target }) => {
      localFile.value = target.result
    }
    const avatarBlob = new Blob([avatarStream], { type: 'image/png' })
    const avatarFile = new File([avatarBlob], 'thumbnail2.jpg')

    emit('coverFile', { avatarFile, coverFile })
  })
})

onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('createCoverCallback')
})
</script>

<template>
  <div class="avatar-upload">
    <div class="avatar-show">
      <template v-if="modelValue">
        <el-image v-if="preview" :src="localFile" fit="scale-down"></el-image>
        <ShowLocalImage :fileId="modelValue" partType="avatar" :width="40" v-else></ShowLocalImage>
      </template>
      <template v-else>
        <el-upload
          name="file"
          :show-file-list="false"
          accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
          :multiple="false"
          :http-request="uploadImage"
        >
          <span class="iconfont icon-add"></span>
        </el-upload>
      </template>
    </div>
    <div class="select-btn">
      <el-upload
        name="file"
        :show-file-list="false"
        accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
        :multiple="false"
        :http-request="uploadImage"
      >
        <el-button type="primary" size="small">选择</el-button>
      </el-upload>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar-upload {
  display: flex;
  justify-content: center;
  align-items: end;
  line-height: normal;
}

.avatar-show {
  background: #ededed;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.icon-add {
  font-size: 30px;
  color: #b9b9b9;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
}

.avatar-show img {
  width: 100%;
  height: 100%;
}

.op {
  position: absolute;
  color: #0e8aef;
  top: 80px;
}

.select-btn {
  vertical-align: bottom;
  margin-left: 5px;
}
</style>
