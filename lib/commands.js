const request = require("request");
//const getJSON = require("./getJSON.js");
const config = require("./config.json");

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

      /*
      * Rewrite to use ASYNC! INSTEAD OF BS CALL BACKS!
      * Coammand to be REWRITTEN SOON
      * JUST TRUST ME!
      */

    }
  },
  "test": {
    process: function (message, args, command) {
      //   Promise.all([requestAsyncURL('/api/job'), requestAsyncURL('/api/printer')])
      Promise.all([requestAsyncURL('/api/printer')])
        .then(function (allData) {
          var body = JSON.parse(allData);
          console.log(body);
        });
    }
  }
};

function requestAsyncURL(path) {
  url = base_url + path;
  return new Promise(function (resolve, reject) {
    request.get({
      url: url,
      headers: { "X-Api-Key": octo_token }
    }, function (err, res, body) {
      if (err) { return reject(err); }
      return resolve(body);
    });
  });
}