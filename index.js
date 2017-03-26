const Discord = require("discord.js");
const bot = new Discord.Client();
const secrets = require("./secrets.json");



bot.on("message", (message) => {
    if(message.content == "!test") {
       message.reply("    go fuck yourself");
       // message.channel.sendMessage("pong");
    }

})


bot.login(secrets.token)