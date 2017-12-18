"use strict";
let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json'));

module.exports.run = async (message, args, command, bot) => {
    config.game = args.join(' ');
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    message.channel.send('Updated Game!');
    bot.user.setGame(config.game);
}

module.exports.help = {
    name: 'game'
}