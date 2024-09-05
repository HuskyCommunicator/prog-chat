import { ElMessageBox } from 'element-plus'
const confirm = ({ message, okfun, showCancelBth = true, okTest = '确定' }) => {
  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: okTest,
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      if (okfun) {
        okfun()
      }
    })
    .catch(() => {})
}
export default confirm
