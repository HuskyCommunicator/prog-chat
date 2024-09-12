const { exec } = require('child_process')
//控制台执行
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('ffmpeg命令执行失败:', error)
      }
      resolve(stdout)
    })
  })
}

const test = async () => {
  const ffmpegPath = 'D:\\program\\code\\web\\prog-chat\\chat\\assets\\ffmpeg.exe'
  const ffprobePath = 'D:\\program\\code\\web\\prog-chat\\chat\\assets\\ffprobe.exe'
  // const filePath = 'D:\\Users\\32153\\Desktop\\i\\sc.hevc'
  // const savePath = 'C:\\Users\\32153\\.easychat\\fileStorage\\U59167251524\\202409\\sc.mp4'
  //
  // const savePath = 'D:\\Users\\32153\\Desktop\\i\\sc.mp4'
  //
  const filePath = 'D:\\Users\\32153\\Desktop\\i\\dm.mp4'
  const savePath = 'C:\\Users\\32153\\.easychat\\fileStorage\\U22960035989/202409/224.mp4'
  //
  console.log('开始获取视频编码格式')
  let command = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
  let result = await execCommand(command)
  result = result.replace(/\r\n/g, '')
  result = result.substring(result.indexOf('=') + 1)
  let codec = result.substring(0, result.indexOf('['))
  console.log('获取的视频编码格式为', codec)

  // 转换视频编码格式
  if (codec === 'hevc') {
    console.log('开始转换视频编码格式')
    command = `${ffmpegPath} -y -i "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
    await execCommand(command)
    console.log('视频编码转化成功')
  }

  // 生成缩略图
  coverPath = savePath + '_cover.png'
  command = `${ffmpegPath} -i "${savePath}" -y -vframes 1 -ss 00:00:05 -vf "scale=min(170\\, iw*min(170/iw\\, 170/ih)):min(170\\, ih*min(170/iw\\, 170/ih))" "${coverPath}"`
  console.log('开始生成缩略图')

  await execCommand(command)
  console.log('缩略图生成成功')
}
test()
