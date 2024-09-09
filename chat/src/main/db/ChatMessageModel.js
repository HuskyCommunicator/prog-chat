import { run, queryAll, queryOne, queryCount, insert, insertOrReplace, insertIgnore, update, deleteData } from './ADB'
import store from '../store'
import { updateNoReadCount } from './ChatSessionUserModel'

const saveMessage = (data) => {
  data.userId = store.getUserId()
  return insertOrReplace('chat_message', data)
}
// 定义一个批量保存消息的函数
const saveMessageBatch = (chatMessageList) => {
  return new Promise(async (resolve, reject) => {
    // 创建一个对象来存储每个会话的未读消息计数
    const chatSessionCountMap = {}

    // 遍历消息列表，计算每个会话的未读消息数
    chatMessageList.forEach((item) => {
      // 根据消息的类型确定联系人的ID
      let contactId = item.contactType == 1 ? item.contactId : item.sendUserId

      // 获取当前会话的未读消息数
      let noReadCount = chatSessionCountMap[contactId]
      if (!noReadCount) {
        // 如果当前会话没有未读消息，则初始化为1
        chatSessionCountMap[contactId] = 1
      } else {
        // 否则，未读消息数加1
        chatSessionCountMap[contactId] = noReadCount + 1
      }
    })

    // 遍历每个会话，更新未读消息数
    for (let item in chatSessionCountMap) {
      await updateNoReadCount({ contactId: item, noReadCount: chatSessionCountMap[item] })
    }
    //批量插入数据
    for (let item of chatMessageList) {
      await saveMessage(item)
    }
    // 解析Promise
    resolve()
  })
}
export { saveMessageBatch }
