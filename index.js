"use strict";
const Discord = require('discord.js');
const bot = new Discord.Client();
const commands = require('./lib/commands.js').commands;
const fs = require('fs');

let config = JSON.parse(fs.readFileSync('./lib/config.json'));
let token = config.discord_token;
bot.prefix = config.prefix;

bot.on("ready", function botReady() {
  console.log('im ready');
  let game = config.game;
  bot.user.setGame(game);
});

bot.on("message", function messageRecived(message) {
  if (message.author.bot === false) {
    if (message.content.startsWith(bot.prefix)) {
      let messageArguments = message.cleanContent.toLowerCase().slice(bot.prefix.length).split(" ");
      let func = commands[messageArguments.shift()];
      let command = message.cleanContent.slice(bot.prefix.length).split(" ").shift().toLowerCase();
      if (func !== undefined) {
        func.process(message, messageArguments, command, bot);
      } else if (command == 'commands') {
        message.channel.send(Object.getOwnPropertyNames(commands));
      } else if (command.length > 0) {
        message.channel.send('Unknown command! Type ' + bot.prefix + 'Commands for a list of commands!');
      }
    }
  }
});

bot.login(token);