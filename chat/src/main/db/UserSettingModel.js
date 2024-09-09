import { run, queryAll, queryOne, queryCount, insert, insertOrReplace, insertIgnore, update, deleteData } from './ADB'
import store from '../store'
const updateContactNoReadCount = ({ userId, noReadCount }) => {
  return new Promise(async (resolve, reject) => {
    let sql = null
    try {
      if (noReadCount === 0) {
        resolve()
        return
      }
      if (noReadCount) {
        sql = 'UPDATE user_setting SET contact_no_read = contact_no_read + ? WHERE user_id = ?'
      } else {
        // 清空未读数
        noReadCount = 0
        sql = 'UPDATE user_setting SET contact_no_read = ? WHERE user_id = ?'
      }
      await run(sql, [noReadCount, userId])
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
export { updateContactNoReadCount }
