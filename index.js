const Discord = require("discord.js");
const bot = new Discord.Client();
const secrets = require("./secrets.json");

var token = secrets.token;
var prefix = secrets.prefix;


var commands = {
  "commandname": {
    func: function (message, args) {
      message.channel.sendMessage("command/channel reply");
    }

  },
  "hi": {
    func: function (message, args) {
      message.channel.sendMessage("Heyo You're Gayo!");
    }
  }

};


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