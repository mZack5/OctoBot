"use strict";
const Discord = require('discord.js');
const bot = new Discord.Client();
const path = require("path");
const express = require('express');
const app = express();

const fs = require('fs');
require('dotenv').config();
const tiktokpinger = require('./lib/src/tiktokPinger');
const port = process.env.PORT || 5000;
let config = JSON.parse(fs.readFileSync('./config.json'));
const http = require("http");

bot.prefix = config.prefix;
bot.commands = new Discord.Collection;

app.use(express.static(__dirname + '/public'));
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname + '/views/index.html'));
});
app.listen(port, () => {
  console.log('Our app is running on http://localhost:' + port);
});

fs.readdir('./lib/', (err, files) => {
  if (err) console.error(err);
  let command_files = files.filter(f => f.split('.').pop() === 'js');
  if (command_files.length <= 0) {
    console.log('somethings wrong bud');
    return;
  } else console.log(`loading ${command_files.length} commands`);

  command_files.forEach((f, i) => {
    let props = require(`./lib/${f}`);
    bot.commands.set(props.help.name, props);
  });
});


bot.on("ready", function botReady() {
  console.log('im ready');
  // This should send a call to /lib/game.js
  // this shouldnt be its own call. 
  // but im lazy

  bot.user.setActivity(config.game, {
    url: config.url,
    type: config.game_state

  });
});

bot.on("message", function messageRecived(message) {
  if (message.author.bot === true) return;
  if (message.channel.type !== 'text' &&
    message.author.id !== config.bot_owner) {
    return message.channel.send('fuck outta my DMs boi');
  }
  let messageArguments = message.content.slice(bot.prefix.length).split(" ");
  messageArguments.shift();
  let command = message.content.slice(bot.prefix.length).split(" ").shift();
  let cmdfunction = bot.commands.get(command);

  if (message.content.startsWith(bot.prefix)) {
    if (cmdfunction) {
      cmdfunction.run(message, messageArguments, command, bot);
    } else if (config.unknown_command_message == "true") {
      message.channel.send("Unknown command!")
    }
  } else if (command == 'prefix') {
    // this words because when checking for a function
    // the first letter is removed, meaning things 
    // like aprefix or @prefix also work
    message.channel.send(`My prefix is currently ${bot.prefix}`);
  }
});


// this stops heroku from disabling my dynamo from no traffic
setInterval(() => {
  http.get('http://fuck-zach.herokuapp.com');
}, 900000);


// this is to check if X tiktoker has uploaded, and send a discord
// message as an alert

// this function should:
/**
 * have an init function in bot.on(ready) which updates 
 * when booting, so reboots dont always invoke an alert
 * 
 * work with multiple tiktokers, should work with however many
 * tiktokers are listed in a json config file
 * 
 * check the last videoid of X tiktokers upload, and not the number
 * of videos they have. Using video numbers can sometimes return a 
 * false positive
 * 
 */

setInterval(() => {
  tiktokpinger.checkIfNewVideos(bot);
}, 180000);




bot.login(process.env.discordtoken);







// google disabled my api key so uh, lets just disable the music bot

//const Music = require('./lib/src/discord-music');
/*
const music = new Music(bot, {
  youtubeKey: process.env.youtubetoken,
botOwner: config.bot_owner,
prefix: bot.prefix,
global: false,         //TODO: Change well bot is running!
maxQueueSize: 25,
clearInvoker: true,
helpCmd: 'musichelp',
playCmd: 'play',
volumeCmd: 'vol',
leaveCmd: 'stop',
disableLoop: true,
anyoneCanSkip: false,
ownerOverMember: true,
enableQueueStat: true,
anyoneCanAdjust: false,
logging: false,
});
*/