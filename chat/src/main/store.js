import Store from 'electron-store'
const store = new Store()

let userId = null

const initUserId = (_userId) => {
  userId = _userId
}
const getUserId = () => {
  return userId
}
const setData = (key, value) => {
  store.set(key, value)
}
const getData = (key) => {
  return store.get(key)
}
const setConfig = (key, value) => {
  store.set(key, value)
}
const getConfig = (key) => {
  return store.get(key)
}
const setUserData = (key, value) => {
  setData(userId + key, value)
}
const getUserData = (key) => {
  return getData(userId + key)
}
const deleteUserData = () => {
  store.delete(userId)
}
export default {
  initUserId,
  getUserId,
  setData,
  getData,
  setUserData,
  getUserData,
  deleteUserData,
  setConfig,
  getConfig
}
