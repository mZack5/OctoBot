 "use strict";
const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./lib/config.json");
const commands = require("./lib/commands.js").commands;
const request = require('request');

let token = config.discord_token;
let prefix = config.prefix;

bot.on("ready", () => {
      let game = config.game;
      bot.user.setGame(game); 
});

bot.on("message", function (message) {
  if (message.author.bot === false) {
    if (message.content.indexOf(prefix) === 0) {
      let messageArguments = message.content.slice(1).split(" ");
      let func = commands[messageArguments.shift()];
      let command = message.content.slice(1).split(" ").shift();
      if (func !== undefined) {
        func.process(message, messageArguments, command);
      } else if (command.length > 0) {
        message.channel.sendMessage("Unknown command! Type !Commands for a list of commands!");
      }
    }
  }
});


bot.login(token);