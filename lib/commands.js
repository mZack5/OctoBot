"use strict";
const request = require("request");
//const getJSON = require("./getJSON.js");
const config = require("./config.json");
const rAsync = require("./request-async.js");

//let requestAsyncURL = rAsync.requestAsyncURL;
let octo_token = config.octo_token;
let base_url = config.base_url;

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

      // let arrayOfStuff = ["/api/job", "/api/printer"];
      // console.log("In the right loop");
      // preload("/api/job").then(function (value) {
      //   console.log("we in bois:", value);
      //     });
    }
  },
  "test": {
    process: function (message, args, command) {
      Promise.all([
        rAsync.requestAsyncURL('/api/job'),
        rAsync.requestAsyncURL('/api/printer')
      ]).then(function (returnedJSON) {
        let job = JSON.parse(returnedJSON[0]);
        let printer = JSON.parse(returnedJSON[1]);

        // console.log(job.job.file.name);

        if (args.length == 0) {
          if (job.state !== "Printing") {
            message.channel.sendMessage(`Currently Not Printing Anything!`);
          } else {
            let printingFor = job.progress.printTime / 60 / 60;
            if (printingFor < 1) {
              printingFor = printingFor * 60;
              printingFor = Math.round(printingFor);
              printingFor = printingFor + " Minutes";
            } else {
              printingFor = printingFor + " Hours";
            }
            let printName = job.job.file.name.slice(0, -6);
            message.channel.sendMessage(`Currently Printing: ${printName}, And I've been printing for ${printingFor}`);
          }
          return;
        }

















      }).catch(function (e) {
        // TODO: Actual Error handling :s
        console.log("Something didnt work:", e)
      });
    }
  }
};
