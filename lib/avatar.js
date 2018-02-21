"use strict";
module.exports.run = async (message, args, command, bot) => {
  if (args < 1) {
    message.channel.send(message.author.avatarURL);


    /** No idea what i was going for here, we will revisit this later. */

    //} else {

    //message.channel.send(message.channel.server.members.get('Zach#3260', params).avatarURL);
    // let user = message.channel.members();
  }
}

module.exports.help = {
  name: 'avatar'
}