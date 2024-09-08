const globalColumnsMap = {
  chat_message: {
    userId: 'user_id',
    messageId: 'message_id',
    sessionId: 'session_id',
    messageType: 'message_type',
    messageContent: 'message_content',
    contactType: 'contact_type',
    sendUserId: 'send_user_id',
    sendUserNickName: 'send_user_nick_name',
    sendTime: 'send_time',
    status: 'status',
    fileSize: 'file_size',
    fileName: 'file_name',
    filePath: 'file_path',
    fileType: 'file_type'
  },
  chat_session_user: {
    userId: 'user_id',
    contactId: 'contact_id',
    contactType: 'contact_type',
    sessionId: 'session_id',
    status: 'status',
    contactName: 'contact_name',
    lastMessage: 'last_message',
    lastReceiveTime: 'last_receive_time',
    noReadCount: 'no_read_count',
    memberCount: 'member_count',
    topType: 'top_type'
  },
  user_setting: {
    userId: 'user_id',
    email: 'email',
    sysSetting: 'sys_setting',
    contactNoRead: 'contact_no_read',
    serverPort: 'server_port'
  }
}

const insert = (sqlPrefix, tableName, data) => {
  const columnsMap = globalColumnsMap[tableName]
  const dbColumns = []
  const params = []
  for (let item in data) {
    if (data[item] !== undefined && columnsMap[item] !== null) {
      dbColumns.push(columnsMap[item])
      params.push(data[item])
    }
  }
  const prepare = '?'.repeat(dbColumns.length).split('').join(',')
  const sql = `${sqlPrefix} ${tableName} (${dbColumns.join(',')}) VALUES (${prepare})`
  console.log(sql)
}
insert('insert', 'chat_message', {
  userId: 1,
  messageId: 1
})
