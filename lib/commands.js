//const request = require("request");
const getJSON = require("./requestJSON.js");
const config = require("./config.json");


var octo_t
oken = config.octo_token;

//var url = 'http://192.168.1.100/api/job'; // test var

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
        function callback(returned_data) {
        
      }
      
     getJSON.returnJSON("http://192.168.1.100","/api/job", function (err, data){
    console.log(status1);
     });


// getJSON.returnJSON(getJSON.returnJSON("http://192.168.1.100","/api/job"));
//console.log(getJSON.returnJSON(("http://192.168.1.100","/api/job")));

      // var status1 = requestJSON("http://192.168.1.100", "/api/job");
      // console.log(status1);
    }
  }
};


