import { defineStore } from 'pinia'
export const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    return {
      userInfo: {}
    }
  },
  action: {
    setInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    getInfo() {
      return this.userInfo
    }
  }
})
