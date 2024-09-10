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
const getPageOffset = (pageNo, totalCount) => {
  // 每页显示的记录数
  const pageSize = 20

  // 计算总页数
  // 如果总记录数能被pageSize整除，则总页数为totalCount / pageSize
  // 否则，总页数为totalCount / pageSize的整数部分加1
  const pageTotal = totalCount % pageSize == 0 ? totalCount / pageSize : Math.floor(totalCount / pageSize) + 1

  //页码是指分页系统中的当前页数
  // 确保页码不小于1
  pageNo = pageNo <= 1 ? 1 : pageNo

  // 确保页码不大于总页数
  pageNo = pageNo > pageTotal ? pageTotal : pageNo

  // 返回包含总页数、偏移量和每页记录数的对象
  return {
    pageTotal, // 总页数
    offset: (pageNo - 1) * pageSize, // 偏移量指从数据集的起始位置开始，跳过的记录数，计算公式为(当前页码 - 1) * 每页记录数
    limit: pageSize // 每页记录数
  }
}

//
const selectMessageList = async (query) => {
  return new Promise(async (resolve, reject) => {
    const { sessionId, pageNo, maxMessageId } = query
    let sql = 'SELECT count(1) FROM chat_message WHERE session_id=? AND user_id=?'
    const totalCount = await queryCount(sql, [sessionId, store.getUserId()])
    const { pageTotal, offset, limit } = getPageOffset(pageNo, totalCount)

    const params = [sessionId, store.getUserId()]
    sql = 'select * from chat_message where session_id=? and user_id=? '
    if (maxMessageId) {
      sql = sql = ' and message_id<?'
      params.push(maxMessageId)
    }
    params.push(offset)
    params.push(limit)
    sql = sql + ' order by message_id limit ?,? '
    const dataList = await queryAll(sql, params)
    resolve({ dataList, pageTotal, pageNo })
  })
}

export { saveMessageBatch, selectMessageList }
