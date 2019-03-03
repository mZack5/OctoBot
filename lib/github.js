"use strict";
let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json'));

module.exports.run = async (message, args, command, bot) => {
  message.channel.send(`You can find the repo for me at: ${config.repo}`);
}

module.exports.help = {
  name: 'github',
  help: 'posts a link to my github repo'
}