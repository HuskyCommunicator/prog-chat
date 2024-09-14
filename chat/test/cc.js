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

let ffmpegPath = 'D:\\program\\code\\web\\prog-chat\\chat\\assets\\ffmpeg.exe'
let ffprobePath = 'D:\\program\\code\\web\\prog-chat\\chat\\assets\\ffprobe.exe'
let filePath = 'D:\\Users\\32153\\Desktopi\\bga.jpg'
let savePath = 'C:\\Users\\32153\\.easychat\\fileStorage\\U07140567134\\202409\\1788.jpg'
//   console.log('ffmpegPath', ffmpegPath, 'ffprobePath', getFFprobePath())
//   console.log('filePath', filePath, 'savePath', savePath)
//   console.log('coverPath', coverPath)

//判断视频格式
let command = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
let result = await execCommand(command)
result = result.replaceAll('\r\n', '')
result = result.substring(result.indexOf('=') + 1)
let codec = result.substring(0, result.indexOf('['))
if ('hevc' === codec) {
  command = `${ffmpegPath}  -y -i "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
  await execCommand(command)
}
//生成缩略图
coverPath = savePath + cover_image_suffix
command = `${ffmpegPath} -i "${savePath}" -y -vframes 1 -vf "scale=min(170\\,iw*min(170/iw\\,170/ih)):min(170\\,ih*min(170/iw\\,170/ih))" "${coverPath}"`
await execCommand(command)
