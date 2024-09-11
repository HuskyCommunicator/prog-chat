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

//分页
const getPageOffset = (pageNo = 1, totalCount) => {
  const pageSize = 20
  const pageTotal = totalCount % pageSize == 0 ? totalCount / pageSize : Number.parseInt(totalCount / pageSize) + 1
  //pageNo小于等于1就是1
  pageNo = pageNo <= 1 ? 1 : pageNo
  //pageNo大于等于总数就是总数
  pageNo = pageNo >= pageTotal ? pageTotal : pageNo
  return {
    pageTotal,
    offset: (pageNo - 1) * pageSize,
    limit: pageSize
  }
}

//
const selectMessageList = (query) => {
  return new Promise(async (resolve, reject) => {
    const { sessionId, pageNo, maxMessageId } = query
    let sql = 'select count(1) from chat_message where session_id = ? and user_id = ?'
    const totalCount = await queryCount(sql, [sessionId, store.getUserId()])
    const { pageTotal, offset, limit } = getPageOffset(pageNo, totalCount)
    const params = [sessionId, store.getUserId()]
    sql = 'select * from chat_message where session_id = ? and user_id = ?'
    if (maxMessageId) {
      sql = sql + 'and message_id <=?'
      params.push(maxMessageId)
    }
    params.push(offset)
    params.push(limit)
    sql = sql + 'order by message_id desc limit ?,?'
    const dataList = await queryAll(sql, params)
    resolve({
      dataList,
      pageTotal,
      pageNo
    })
  })
}

//
const updateMessage = (data, paramData) => {
  paramData.userId = store.getUserId()
  return update('chat_message', data, paramData)
}

export { saveMessageBatch, selectMessageList, saveMessage, updateMessage }
