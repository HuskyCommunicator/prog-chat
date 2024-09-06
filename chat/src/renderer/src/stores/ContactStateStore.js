import { defineStore } from 'pinia'
export const useContactStateStore = defineStore('ContactStateInfo', {
  state: () => {
    return {
      contactReload: null,
      delContactId: null,
      data: null
    }
  },
  actions: {
    setData(data) {
      this.data = data
      localStorage.setItem('group', JSON.stringify(data))
    },
    setContactReload(state) {
      this.contactReload = state
    },
    delContactId(delContactId) {
      this.delContactId = delContactId
    }
  }
})
