"use strict";
module.exports.run = async (message, args, command, bot) => {
  message.channel.send(message.author.avatarURL);
}

module.exports.help = {
  name: 'avatar'
}