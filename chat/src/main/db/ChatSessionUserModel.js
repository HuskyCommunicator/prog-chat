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
      // 遍历聊天会话列表
      for (let i = 0; i < chatSessionList.length; i++) {
        const sessionInfo = chatSessionList[i] // 获取当前会话信息
        sessionInfo.status = 1 // 设置会话状态为1

        // 根据联系人ID查询用户会话
        let sessionData = await selectUserSessionByContactId(sessionInfo.contactId)

        if (sessionData) {
          // 如果会话存在，递归调用函数更新会话信息
          await saveOrUpdateChatSessionBatch4Init(sessionInfo)
        } else {
          // 如果会话不存在，添加新的会话
          await addChatSession(sessionInfo)
        }
      }
      resolve() // 完成后解析Promise
    } catch (err) {
      reject(err) // 捕获错误并拒绝Promise
    }
  })
}
//更新未读数
const updateNoReadCount = ({ contactId, noReadCount }) => {
  const sql = 'UPDATE chat_session_user SET no_read_count = no_read_count+? WHERE user_id = ? AND contact_id = ?'
  return run(sql, [noReadCount, store.getUserId(), contactId])
}

const selectUserSessionList = () => {
  let sql = 'select * from chat_session_user where user_id= ? and status=1'
  console.log(sql)
  return queryAll(sql, [store.getUserId()])
}
//删除会话消息
const delChatSession = (contactId) => {
  const paramData = { userId: store.getUserId(), contactId }
  const sessionInfo = {
    status: 0
  }
  return update('chat_session_user', sessionInfo, paramData)
}

//置顶会话消息
const topChatSession = (contactId, topType) => {
  const paramData = { userId: store.getUserId(), contactId }
  const sessionInfo = {
    topType
  }
  return update('chat_session_user', sessionInfo, paramData)
}

export { saveOrUpdateChatSessionBatch4Init, updateNoReadCount, updateChatSession, selectUserSessionList, delChatSession, topChatSession }
