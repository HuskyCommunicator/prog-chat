import { run, queryAll, queryOne, queryCount, insert, insertOrReplace, insertIgnore, update, deleteData } from './ADB'
import store from '../store'

// 根据contactId查询用户会话
const selectUserSessionByContactId = (contactId) => {
  let sql = `SELECT * FROM chat_session_user WHERE user_id= ? and contact_id = ? `
  return queryOne(sql, [store.getUserId(), contactId])
}

// 添加新的聊天会话
const addChatSession = (sessionInfo) => {
  sessionInfo.userId = store.getUserId()
  insertIgnore('chat_session_user', sessionInfo)
}

// 更新现有的聊天会话
const updateChatSession = (sessionInfo) => {
  const paramData = {
    userId: store.getUserId(),
    contactId: sessionInfo.contactId
  }
  const updateInfo = Object.assign({}, sessionInfo)
  updateInfo.userId = null
  updateInfo.contactId = null
  return update('chat_session_user', updateInfo, paramData)
}

// 批量保存或更新聊天会话
const saveOrUpdateChatSessionBatch4Init = (chatSessionList) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < chatSessionList.length; i++) {
        const sessionInfo = chatSessionList[i]
        sessionInfo.status = 1
        let sessionData = await selectUserSessionByContactId(sessionInfo.contactId)
        if (sessionData) {
          // 如果会话存在，则更新
          await updateChatSession(sessionInfo)
        } else {
          // 如果会话不存在，则新增
          await addChatSession(sessionInfo)
        }
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

export { saveOrUpdateChatSessionBatch4Init }
