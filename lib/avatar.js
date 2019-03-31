"use strict";
module.exports.run = async (message, args, command, bot) => {
  if (args < 1) {
    message.channel.send(message.author.avatarURL);
  }
}

module.exports.help = {
  name: 'avatar',
  help: 'displays the users avatar'
}