const add_tables = [
  `CREATE TABLE IF NOT EXISTS chat_message (
    user_id VARCHAR NOT NULL,
    message_id BIGINT NOT NULL DEFAULT NULL,
    session_id VARCHAR,
    message_type INTEGER,
    message_content VARCHAR,
    contact_type INTEGER,
    send_user_id VARCHAR,
    send_user_nick_name VARCHAR,
    send_time BIGINT,
    status INTEGER,
    file_size BIGINT,
    file_name VARCHAR,
    file_path VARCHAR,
    file_type INTEGER,
    PRIMARY KEY (user_id, message_id)
  );`,
  `CREATE TABLE IF NOT EXISTS chat_session_user (
    user_id VARCHAR NOT NULL DEFAULT '0',
    contact_id VARCHAR(11) NOT NULL,
    contact_type INTEGER,
    session_id VARCHAR(11),
    status INTEGER DEFAULT 1,
    contact_name VARCHAR(20),
    last_message VARCHAR(500),
    last_receive_time BIGINT,
    no_read_count INTEGER DEFAULT 0,
    member_count INTEGER,
    top_type INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, contact_id)
  );`,
  `CREATE TABLE IF NOT EXISTS user_setting (
    user_id VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    sys_setting VARCHAR,
    contact_no_read INTEGER,
    server_port INTEGER,
    PRIMARY KEY (user_id)
  );`
]

const alter_tables = [
  {
    tableName: 'user_setting',
    field: 'email',
    sql: 'ALTER TABLE user_setting ADD COLUMN email VARCHAR;'
  }
]

const add_index = ['CREATE INDEX IF NOT EXISTS idx_session_id ON chat_message(session_id ASC);']

export { add_tables, alter_tables, add_index }
