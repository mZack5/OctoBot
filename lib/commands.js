"use strict";


/*
*
* File that contains the commands object, which holds all the possible commands
* for the bot, each Object Name is the command, the function associated with it is called
* when the command is called. The function expects 3 params, the original message object from discord, 
* the command arguments, and the command itself.
*
*/

/** TODO:
 * - Add a preload command for octoprint endpoints.
 * - Send a Pre-Message saying fetching data, then edit the message with
 * the expected output.
 */

const request = require('request');
const fs = require('fs');
const config = require('./config.json');
const rAsync = require('./request-async.js');
const time = require('./time.js');

let repo = config.repo;
let octo_token = config.octo_token;
let base_url = config.base_url;

exports.commands = {
  "commands": {
    process: function (message, args, command, bot) {
      //  TODO: Make command print commands from object commands in lib/commands.js
      message.channel.send([
        " ¯\\\_(ツ)_/¯ "
      ]);
    }

  },
  "ping": {
    process: function (message, args, command, bot) {
      message.channel.send('Pong!');
    }
  },
  "github": {
    process: function (message, args, command, bot) {
      message.channel.send(`You can find the repo for me at: ${repo}`);
    }
  },
  "avatar": {
    process: function (message, args, command, bot) {
      message.channel.send(message.author.avatarURL);
    }
  },
  "game": {
    process: function (message, args, command, bot) {
      config.game = args.join(' ');
      message.channel.send(':eyes:')
      fs.writeFileSync('./lib/config.json', JSON.stringify(config, null, 2));
    }
  },
  "prefix": {
    process: function (message, args, command, bot) {
      config.prefix = args[0];
      bot.prefix = args[0];
      console.log(config.prefix);
      message.channel.send(':eyes:')
      fs.writeFileSync('./lib/config.json', JSON.stringify(config, null, 2));
    }
  },
  "test": {
    process: function (message, args, command, bot) {
    }
  },
  "print": {
    /*
    * What i want to do with this file is to use another commands object,
    * but i dont know if that would be better, but it would be cleaner and easier to read. 
    * In my todo i will have a rewrite of this command to use a seperate commands object.
    * currently, i would just like the command to function
    */

    process: function (message, args, command, bot) {
      Promise.all([
        rAsync.requestAsyncURL('/api/job'),
        rAsync.requestAsyncURL('/api/printer')
      ]).then(function (returnedJSON) {
        let job = JSON.parse(returnedJSON[0]);
        let printer = JSON.parse(returnedJSON[1]);

        if (args.length == 0) {
          if (job.state !== "Printing") {
            message.channel.send(`Currently Not Printing Anything!`);
          } else {
            let printingFor = time.getTimeRunning(job.progress.printTime);
            let printName = job.job.file.name.slice(0, -6);
            message.channel.send(`Currently Printing: ${printName}, And I've been printing for ${printingFor}`);
          }
          return;
        }

        if (args.length > 0) {
          if (args[0] == "cmd") {
            pass; // will continue working on this command later
          }
        }
      }).catch(function (e) {
        // TODO: Actual Error handling :s
        // If octoprint is returning unexpected JSON, it will auto
        // error, i should prob add error handling for that
        console.log("Something didnt work:", e)
      });
    }
  }
};
