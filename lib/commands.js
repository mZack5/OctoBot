const request = require("request");
const config = require("./config.json");


var octo_token = config.octo_token;
var url = 'http://192.168.1.100/api/job'; // test var

exports.commands = {
  "commands": {
    process: function (message, args, command) {
      //  TODO: Make command print commands from object commands in lib/commands.js
      message.channel.sendMessage([
        "TODO: fix this shitty commands array",
        "!hi",
        "!commands",
        "!github"
      ]);
    }

  },
  "hi": {
    process: function (message, args, command) {
      message.channel.sendMessage("Heyo You're Gayo!");
    }
  },
  "github": {
    process: function (message, args, command) {
      message.channel.sendMessage("You can find the repo for me at: https://github.com/mZack5/OctoBot");
    }
  },
  "avatar": {
    process: function (message, args, command) {
      message.channel.sendMessage(message.author.avatarURL);
    }
  },
  "jordan": {
    process: function (message, args, command) {
      message.channel.sendMessage("is a cuck");
    }
  },
  "status": {
    process: function (message, args, command) {
       request.get({
         url: url,
         json: true,
         headers: { "X-Api-Key": octo_token }
       }, (err, res, data) => {
         if (err) {
           console.log("Error:", err);
         } else if (res.statusCode !== 200) {
           console.log('Status:', res.statusCode);
         } else {
           console.log("in the right loop! ");
           //console.log(data);
      //  var info = JSON.parse(data);
        console.log(data.job.averagePrintTime);
         }
       });
     }
  }
};