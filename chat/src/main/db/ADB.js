const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const os = require('os')
const NODE_ENV = process.env.NODE_ENV
const userDir = os.homedir()
console.log(userDir)

const dbFolder = userDir + (NODE_ENV === 'development' ? '/.easychattest/' : '/.easychat/')
console.log(dbFolder)

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder)
}
const db = new sqlite3.Database(dbFolder + 'local.db')
const createTable = () => {}
class ADB {
  constructor(db_path) {
    this.db_path = db_path
    this.db = new sqlite3.Database(db_path, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log('Connected to the database.')
    })
  }
}
export { createTable }
