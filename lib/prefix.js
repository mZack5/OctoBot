"use strict";

let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./confi\g.json'));

module.exports.run = async (message, args, command, bot) => {
  if (args.length > 0) {
    config.prefix = args[0];
    bot.prefix = args[0];
    message.channel.send('Prefix changed!');
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  } else message.channel.send('Prefix can\'t be blank!');
}

module.exports.help = {
  name: 'prefix'
}