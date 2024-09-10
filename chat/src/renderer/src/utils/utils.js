import moment from 'moment'

const isEmpty = (str) => {
  if (str == null || str == '' || str == undefined) {
    return true
  }
  return false
}
const getAreaInfo = (data) => {
  if (isEmpty(data)) {
    return '-'
  }
  return data.replace(',', ' ')
}
const formatDate = (timestamp) => {
  const timestampTime = moment(timestamp)
  const days = Number.parseInt(moment().format('YYYYMMDD')) - Number.parseInt(timestampTime.format('YYYYMMDD'))

  if (days === 0) {
    return timestampTime.format('HH:mm')
  } else if (days === 1) {
    return '昨天'
  } else if (days >= 2 && days < 7) {
    // 大于1天小于7天显示星期几
    return timestampTime.format('dddd')
  } else if (days >= 7) {
    // 显示年月日
    return timestampTime.format('YY/MM/DD')
  }
}

export default { isEmpty, getAreaInfo, formatDate }
