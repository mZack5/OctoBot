"use strict";
const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./lib/config.json");
const commands = require("./lib/commands.js").commands;

let token = config.discord_token;
let prefix = config.prefix;

bot.on("ready", () => {
  let game = config.game;
  bot.user.setGame(game);
});

bot.on("message", function (message) {
  if (message.author.bot === false) {
    if (message.content.indexOf(prefix) === 0) {
      let messageArguments = message.cleanContent.toLowerCase().slice(1).split(" ");
      let func = commands[messageArguments.shift()];
      let command = message.cleanContent.slice(1).split(" ").shift().toLowerCase();
      if (func !== undefined) {
        func.process(message, messageArguments, command);
      } else if (command.length > 0) {
        message.channel.send('Unknown command! Type ' + prefix + 'Commands for a list of commands!');
      }
    }
  }
});


bot.login(token);