const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const os = require('os')
const NODE_ENV = process.env.NODE_ENV
const userDir = os.homedir()

// 从 Tables 模块导入表、索引和修改表的 SQL 语句
import { add_tables, add_index, alter_tables } from './Tables'

// 根据环境变量设置数据库文件夹路径
const dbFolder = userDir + (NODE_ENV === 'development' ? '/.easychattest/' : '/.easychat/')

// 如果数据库文件夹不存在，则创建它
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder)
}

// 创建或打开数据库文件
const db = new sqlite3.Database(dbFolder + 'local.db')

// 全局对象，用于存储表的列信息
const globalColumnsMap = {}

// 创建表的函数
const createTable = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 创建表
      for (const item of add_tables) {
        await db.run(item)
      }
      // 创建索引
      for (const item of add_index) {
        await db.run(item)
      }
      // 修改表
      for (const item of alter_tables) {
        const fieldList = await queryAll(`PRAGMA table_info(${item.tableName})`, [])
        const field = fieldList.some((row) => row.name === item.field)
        if (!field) {
          await db.run(item.sql)
        }
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// 初始化表的列信息映射
const initTableColumnsMap = async () => {
  let sql = `select name from sqlite_master where type='table' AND name!='sqlite_sequence';`
  const tables = await queryAll(sql, [])
  for (let i = 0; i < tables.length; i++) {
    sql = `PRAGMA table_info(${tables[i].name});`
    let columns = await queryAll(sql, [])
    const columnsMapItem = {}
    for (let j = 0; j < columns.length; j++) {
      const column = columns[j]
      columnsMapItem[toCamelCase(columns[j].name)] = columns[j].name
    }
    globalColumnsMap[tables[i].name] = columnsMapItem
  }
  // console.log('initTableColumnsMap', globalColumnsMap)
}

// 将数据库对象转换为业务对象
const convertDbObj2BizObj = (data) => {
  if (!data) {
    return null
  }
  const bizData = {}
  for (let item in data) {
    bizData[item] = data[item]
  }
  return bizData
}

// 将字符串转换为驼峰命名法
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, function (match, p1) {
    return String.fromCharCode(p1.charCodeAt(0) - 32)
  })
}

// 执行查询并返回所有结果
const queryAll = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.all(params, (err, row) => {
      if (err) {
        resolve([])
      }
      row.forEach((item, index) => {
        row[index] = convertDbObj2BizObj(item)
      })
      resolve(row)
    })
    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Error finalizing statement:', finalizeErr)
      }
    })
  })
}

// 执行查询并返回单个结果
const queryOne = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.get(params, (err, row) => {
      if (err) {
        resolve({})
      }
      resolve(convertDbObj2BizObj(row))
      //  console.log(`执行的SQL语句为sql:${sql},params:${params}，row:${JSON.stringify(row)}`)
    })
    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Error finalizing statement:', finalizeErr)
      }
    })
  })
}

// 执行查询并返回计数结果
const queryCount = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.get(params, (err, row) => {
      if (err) {
        resolve(0)
      }
      resolve(Array.from(Object.values(row))[0])
    })
    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Error finalizing statement:', finalizeErr)
      }
    })
  })
}

// 执行数据库操作
const run = (sql, params) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql)
    stmt.run(params, (err, row) => {
      if (err) {
        console.error('SQL error:', err)
        //console.log(`执行的SQL语句为sql:${sql},params:${params},row:${JSON.stringify(row)}`)

        resolve('操作数据库失败')
      }
      // console.log(`执行的SQL语句为sql:${sql},params:${params},执行记录数:${this.changes}`)
      resolve(this.changes)
    })
    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Error finalizing statement:', finalizeErr)
      }
    })
  })
}

// 插入数据到表中
const insert = (sqlPrefix, tableName, data) => {
  const columnsMap = globalColumnsMap[tableName]
  const dbColumns = []
  const params = []

  for (let item in data) {
    if (data[item] !== undefined && columnsMap[item] !== undefined) {
      dbColumns.push(columnsMap[item])
      params.push(data[item])
    }
  }

  if (dbColumns.length === 0) {
    throw new Error('No valid columns found for insertion.')
  }

  const prepare = dbColumns.map(() => '?').join(',')
  const sql = `${sqlPrefix} ${tableName} (${dbColumns.join(',')}) VALUES (${prepare})`
  return run(sql, params)
}

// 插入或覆盖数据到表中
const insertOrReplace = (tableName, data) => {
  return insert('INSERT OR REPLACE INTO', tableName, data)
}

// 插入数据到表中，如果数据已存在，则忽略
const insertIgnore = (tableName, data) => {
  return insert('INSERT OR IGNORE INTO', tableName, data)
}

// 更新数据
const update = (tableName, data, paramData) => {
  const columnsMap = globalColumnsMap[tableName]
  const dbColumns = []
  const params = []
  const whereColumns = []

  for (let item in data) {
    if (data[item] !== undefined && columnsMap[item] !== null) {
      dbColumns.push(`${columnsMap[item]} = ?`)
      params.push(data[item])
    }
  }

  for (let item in data) {
    if (paramData[item]) {
      params.push(paramData[item])
      whereColumns.push(`${columnsMap[item]} = ?`)
    }
  }

  const sql = `UPDATE ${tableName} SET ${dbColumns.join(',')} ${whereColumns.length > 0 ? 'WHERE ' : ''}${whereColumns.join(' AND ')}`
  return run(sql, params)
}

const deleteData = (tableName, where) => {
  const sql = `DELETE FROM ${tableName} WHERE ${where}`
  return run(sql, [])
}

// 初始化函数，串行化执行创建表和初始化列信息映射
const init = () => {
  db.serialize(async () => {
    await createTable()
    await initTableColumnsMap()
  })
}
init()

// 导出 createTable 函数
export { run, queryAll, queryOne, queryCount, insert, insertOrReplace, insertIgnore, update, deleteData, createTable }
