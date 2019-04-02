'use strict';
let fs = require('fs');

module.exports.run = async (message, args, command, bot) => {
  
  let config = JSON.parse(fs.readFileSync('./config.json'));

  if (message.member.hasPermission('ADMINISTRATOR') || message.author.id == config.bot_owner) {
    message.delete();
    if (args.length > 0) {
      for (let i = 0; i < 5; i++) {
        message.channel.send(args.join(' '));
      }
    } else {
      message.channel.send('Can\'t spam nothing\!')
        .then(msg => msg.delete(3000));
    }
  } else {
    message.channel.send('Only admins can use this command!')
      .then(msg => msg.delete(3000));
  }
}

module.exports.help = {
  name: 'spam',
  help: 'spams a message 5 times'
}