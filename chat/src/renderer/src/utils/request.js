// 引入所需的模块
import axios from 'axios' // 引入axios库，用于发送HTTP请求
import { ElLoading } from 'element-plus' // 引入Element Plus的加载组件，用于显示加载动画
import Message from './message.js' // 引入自定义的消息组件，用于显示提示信息
import Api from './api.js' // 引入API配置文件

// 定义一些常量
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8' // 表单提交的内容类型
const contentTypeJson = 'application/json' // JSON提交的内容类型
const responseTypeJson = 'json' // 响应的数据类型

let loading = null // 用于存储加载动画的实例

// 创建axios实例
const instance = axios.create({
  withCredentials: true, // 允许跨域请求携带cookie
  baseURL: (import.meta.env.PROD ? Api.prodDomain : '') + '/api', // 设置基础URL
  timeout: 10 * 1000 // 设置请求超时时间
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 如果需要显示加载动画，则创建加载动画实例
    if (config.showLoading) {
      loading = ElLoading.service({
        lock: true,
        text: '加载中......',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    // 返回配置对象，继续请求
    return config
  },
  (error) => {
    // 如果请求失败，关闭加载动画，并显示错误信息
    if (error.config.showLoading && loading) {
      loading.close()
    }
    Message.error('请求发送失败')
    // 返回Promise的拒绝状态，中断请求
    return Promise.reject('请求发送失败')
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 提取响应配置
    const { showLoading, errorCallback, showError = true, responseType } = response.config
    // 如果需要显示加载动画，则关闭加载动画
    if (showLoading && loading) {
      loading.close()
    }
    // 提取响应数据
    const responseData = response.data
    // 如果响应类型为arraybuffer或blob，则直接返回响应数据
    if (responseType == 'arraybuffer' || responseType == 'blob') {
      return responseData
    }

    // 根据响应数据的code字段处理请求结果
    if (responseData.code == 200) {
      // 如果code为200，表示请求成功，返回响应数据
      return responseData
    } else if (responseData.code == 901) {
      // 如果code为901，表示登录超时，发送reLogin事件，并返回Promise的拒绝状态
      setTimeout(() => {
        window.ipcRenderer.send('reLogin')
      }, 2000)
      return Promise.reject({ showError: true, msg: '登录超时' })
    } else {
      // 如果code为其他值，表示请求出错，调用错误回调函数，并返回Promise的拒绝状态
      if (errorCallback) {
        errorCallback(responseData)
      }
      return Promise.reject({ showError: showError, msg: responseData.info })
    }
  },
  (error) => {
    // 如果请求失败，关闭加载动画，并返回Promise的拒绝状态
    if (error.config.showLoading && loading) {
      loading.close()
    }
    return Promise.reject({ showError: true, msg: '网络异常' })
  }
)

// 定义请求函数
const request = (config) => {
  // 提取请求配置
  const {
    url,
    params,
    dataType,
    showLoading = true,
    responseType = responseTypeJson,
    showError = true
  } = config
  // 根据dataType设置内容类型
  let contentType = contentTypeForm
  // 创建表单对象，并添加参数
  let formData = new FormData()
  for (let key in params) {
    formData.append(key, params[key] == undefined ? '' : params[key])
  }
  // 如果dataType为json，则设置内容类型为JSON
  if (dataType != null && dataType == 'json') {
    contentType = contentTypeJson
  }
  // 从localStorage中获取token
  const token = localStorage.getItem('token')
  // 设置请求头
  let headers = {
    'Content-Type': contentType,
    'X-Requested-With': 'XMLHttpRequest',
    token: token
  }
  // 发送POST请求，并处理错误
  return instance
    .post(url, formData, {
      headers: headers,
      showLoading: showLoading,
      errorCallback: config.errorCallback,
      showError: showError,
      responseType: responseType
    })
    .catch((error) => {
      // 如果请求失败，显示错误信息，并返回null
      if (error.showError) {
        Message.error(error.msg)
      }
      return null
    })
}

// 导出请求函数
export default request
