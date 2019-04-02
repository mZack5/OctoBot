'use strict';
let fs = require('fs');

module.exports.run = async (message, args, command, bot) => {
  let config = JSON.parse(fs.readFileSync('./config.json'));
  message.channel.send(`You can find the repo for me at: ${config.repo}`);
}

module.exports.help = {
  name: 'github',
  help: 'posts a link to my github repo'
}