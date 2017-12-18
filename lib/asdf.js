"use strict";
module.exports.run = async (message, args, command, bot) => {
  
  const channel = message.member.voiceChannel;
  console.log(channel);

  channel.leave()
    .then(connection => console.log('left!!'))
    .catch(console.error);
}

module.exports.help = {
  name: 'asdf'
}