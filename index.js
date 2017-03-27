const Discord = require("discord.js");
const bot = new Discord.Client();
const secrets = require("./lib/secrets.json");
const commands = require("./lib/commands.js").commands;

var token = secrets.token;
var prefix = secrets.prefix;


bot.on("message", function (message) {
  if (message.content.indexOf(prefix) === 0) {
    var messageArray = message.content.slice(1).split(" ");
    var cmd = commands[messageArray.shift()];
    if (cmd !== undefined) {
      cmd.func(message, messageArray);
    } else {
      message.channel.sendMessage("Unknown command my dude");
    }
  }
});


bot.login(token)