const request = require("request");
//const getJSON = require("./getJSON.js");
const config = require("./config.json");
const rAsync = require("./request-async.js");

//var requestAsyncURL = rAsync.requestAsyncURL;
var octo_token = config.octo_token;
var base_url = config.base_url;
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



    }
  },
  "test": {
    process: function (message, args, command) {

      Promise.all([
        rAsync.requestAsyncURL('/api/job'),
        rAsync.requestAsyncURL('/api/printer')
      ]).then(function (returnedJSON) {
        var job = returnedJSON[0];
        var printer = returnedJSON[1];
        var printer_parsed = JSON.parse(printer);
        console.log(printer_parsed);

       });//.catch(console.log("wait guys i messed up"));
    }
  }
};