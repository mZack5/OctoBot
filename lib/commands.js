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
  "ping": {
    help: "Send a Pong!",
    process: function (message, args, command, bot) {
      message.channel.send('Pong!');
    }
  },
  "github": {
    help: "Sends a link to my git repo!",
    process: function (message, args, command, bot) {
      message.channel.send(`You can find the repo for me at: ${repo}`);
    }
  },
  "avatar": {
    help: "Sends a link to your avatar's URL",
    process: function (message, args, command, bot) {
      message.channel.send(message.author.avatarURL);
    }
  },
  "game": {
    process: function (message, args, command, bot) {
      help: "Changes the game i\'m currently playing!",
        config.game = args.join(' ');
      fs.writeFileSync('./lib/config.json', JSON.stringify(config, null, 2));
      message.channel.send('Updated Game!');
      bot.user.setGame(config.game);
    }
  },
  "prefix": {
    help: "Change my command prefix",
    process: function (message, args, command, bot) {
      if (args.length > 0) {
        config.prefix = args[0];
        bot.prefix = args[0];
        console.log('config prefix is going to be ' + bot.prefix);
        message.channel.send('Prefix changed!')
        fs.writeFileSync('./lib/config.json', JSON.stringify(config, null, 2));
      } else message.channel.send('Prefix can\'t be blank!');
    }
  },
  "test": {
    help: "we don\'t talk about this",
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
    help: "WORK IN PROGRESS",
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
