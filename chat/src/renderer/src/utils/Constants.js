//文件类型
const File_TYPE = {
  jpeg: 0,
  jpg: 0,
  png: 0,
  gif: 0,
  bmp: 0,
  webp: 0,
  mp4: 1,
  avi: 1,
  rmvb: 1,
  mkv: 1,
  mov: 1,
  0: '图片',
  1: '视频',
  2: '文件'
}
const getFileType = (suffix) => {
  // 如果后缀未定义，返回默认文件类型 2
  if (suffix == undefined) {
    return 2
  }
  // 如果后缀是字符串，将其转换为小写
  if (typeof suffix === 'string') {
    suffix = suffix.toLowerCase()
  }
  // 从 File_TYPE 对象中获取对应的文件类型
  const fileType = File_TYPE[suffix]
  // 如果文件类型未定义，返回默认文件类型 2，否则返回对应的文件类型
  return fileType == undefined ? 2 : fileType
}

export { getFileType }
