'use strict';
const Discord = require('discord.js');
const bot = new Discord.Client();
const path = require('path');
const express = require('express');
const schedule = require('node-schedule');
const app = express();

const fs = require('fs');
require('dotenv').config();
const tiktokpinger = require('./lib/src/tiktokPinger');
const port = process.env.PORT || 5000;
let config = JSON.parse(fs.readFileSync('./config.json'));
const http = require('http');

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


bot.on('ready', function botReady() {
  console.log('Im back in the land of the living');
  // This should send a call to /lib/game.js
  // this shouldnt be its own call. 
  // but im lazy

  bot.user.setActivity(config.game, {
    url: config.url,
    type: config.game_state

  });
});

bot.on('message', function messageRecived(message) {
  if (message.author.bot === true) return;
  if (message.channel.type !== 'text' &&
    message.author.id !== config.bot_owner) {
    return message.channel.send('fuck outta my DMs boi');
  }
  let messageArguments = message.content.slice(bot.prefix.length).split(' ');
  messageArguments.shift();
  let command = message.content.slice(bot.prefix.length).split(' ').shift();
  let cmdfunction = bot.commands.get(command);

  if (message.content.startsWith(bot.prefix)) {
    if (cmdfunction) {
      cmdfunction.run(message, messageArguments, command, bot);
    } else if (config.unknown_command_message == 'true') {
      message.channel.send('Unknown command!')
    }
  } else if (command == 'prefix') {
    // this words because when checking for a function
    // the first letter is removed, meaning things 
    // like aprefix or @prefix also work

    // TODO: make this not work based on len of prefix, 
    // so !prefix actually works likes its supposed too
    message.channel.send(`My prefix is currently ${bot.prefix}`);
  }
});

bot.on('error', (error) => {
  console.error(`Shit\'ts broken fam ${error}`);
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
 */

let job = schedule.scheduleJob({
  minute: 30
}, function () {
  tiktokpinger.checkIfNewVideos(bot);
});
let job2 = schedule.scheduleJob({
  minute: 58
}, function () {
  tiktokpinger.checkIfNewVideos(bot);
});

// this is to tell my friend to brush his teeth
let job3 = schedule.scheduleJob({
  hour: 18,
  minute: 5
}, function () {
  let teeth = JSON.parse(fs.readFileSync('./lib/src/teeth.json'));
  bot.channels.get('381974359843012613').send(`<@139465047704469504> ${teeth.brush[Math.floor(Math.random() * Math.floor(teeth.brush.length))]}`);
});




bot.login(process.env.discordtoken);
