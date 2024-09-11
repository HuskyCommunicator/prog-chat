const test = () => {
  const ffprobePath = "E:\\workspace-teach-front\\easychat-front\\assets\\ffprobe.exe";
  const command = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name`;
  console.log(command);
};

test();
