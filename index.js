const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./lib/config.json");
const commands = require("./lib/commands.js").commands;
//const request = require('request');

var token = config.discord_token;
var prefix = config.prefix;


bot.on("ready", () => {
      bot.user.setGame("Dank Memes"); 
});

bot.on("message", function (message) {
  if (message.author.bot === false) {
    if (message.content.indexOf(prefix) === 0) {
      var messageArguments = message.content.slice(1).split(" ");
      var func = commands[messageArguments.shift()];
      var command = message.content.slice(1).split(" ").shift();
      if (func !== undefined) {
        func.process(message, messageArguments, command);
      } else if (command.length > 0) {
        message.channel.sendMessage("Unknown command! Type !Commands for a list of commands!");
      }
    }
  }
});


bot.login(token);