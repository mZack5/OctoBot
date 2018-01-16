"use strict";
let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json'));

module.exports.run = async (message, args, command, bot) => {


  if (message.member.hasPermission('ADMINISTRATOR') || message.author.id == config.bot_owner) {
    message.delete();
    for (let i = 0; i < 5; i++) {
      message.channel.send(args.join(' '));
    }
  } else {
    message.channel.send('Only admins can use this command!')
      .then(msg => msg.delete(3000));
  }
}

module.exports.help = {
  name: 'spam'
}