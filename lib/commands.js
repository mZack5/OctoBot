//const request = require("request");
const getJSON = require("./getJSON.js");
const config = require("./config.json");


var octo_token = config.octo_token;
//var url = 'http://192.168.1.100/api/job'; // test var

exports.commands = {
  "commands": {
    process: function (message, args, command) {
      //  TODO: Make command print commands from object commands in lib/commands.js
      message.channel.sendMessage([
        //"TODO: fix this shitty commands array",
        "!hi",
        "!commands",
        "!github",
        "alot more im too lazy to add"
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
  "print": {
    process: function (message, args, command) {
      getJSON.returnJSON("http://192.168.1.100", "/api/job", (result) => {
        if (args.length == 0) {
          if (result.state !== "Printing") {
          message.channel.sendMessage("No Print Currently Running!");
        } else {
          var fileName = result.job.file.name.slice(0, -6);
          message.channel.sendMessage(`Currently Printing ${fileName} `);
        }
      
    } else if (args) {
// IF ARGS IS SOMETHING THEN LETS DO IT!
    }
      });
    }
  }

};
