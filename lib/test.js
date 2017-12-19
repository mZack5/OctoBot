"use strict";
module.exports.run = async (message, args, command, bot) => {
  
  // const channel = message.member.voiceChannel;
  // console.log(JSON.stringify(message.member.voiceChannel, null, 4));

  channel.join()
    .then(connection => console.log('Connected!'))
    .catch(console.error);
}

module.exports.help = {
  name: 'test'
}