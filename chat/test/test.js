const { exec } = require('child_process')
const test = async () => {
  const ffprobePath = 'D:\\program\\code\\web\\prog-chat\\chat\\assets\\ffprobe.exe'
  const command = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name "D:\\Users\\32153\\Desktop\\i\\dm.mp4"`
  let result = await execCommand(command)
  result = result.replaceAll('\r\n', '')
  result = result.substring(result.indexOf('=') + 1)
  let codec = result.substring(0, result.indexOf('['))
  console.log('获取的视频格式编码为', codec)
}

// D:\\program\\code\\web\\prog-chat\\chat\\assets\\ffprobe.exe -v error -select_streams v:0 -show_entries stream=codec_name "D:\\Users\\32153\\Desktop\\i\\dm.mp4"

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      console.log('ffmpeg命令:', command)
      if (error) {
        console.error('ffmpeg命令执行失败:', error)
      }
      resolve(stdout)
    })
  })
}
test()
