'use strict';
const Discord = require('discord.js');
const bot = new Discord.Client();

const schedule = require('node-schedule');
const fs = require('fs');
const request = require('request');
const tiktokpinger = require('./lib/src/tiktokPinger');

const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 5000;
let config = JSON.parse(fs.readFileSync('./config.json'));
bot.prefix = config.prefix;


app.use(express.static(__dirname + '/public'));
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname + '/views/index.html'));
});
app.listen(port, () => {
  console.log('Our app is running on http://localhost:' + port);
});

bot.commands = new Discord.Collection;
fs.readdir('./lib/', (err, files) => {
  if (err) console.error(err);
  // this line only selects .js files, and adds them to command_files
  let command_files = files.filter(f => f.includes('.js'));
  for (let cmd of command_files) {
    let props = require(`./lib/${cmd}`)
    bot.commands.set(props.help.name, props);
  }
});


bot.on('ready', function botReady() {
  console.log('Im back in the land of the living');

  // this is to update tiktokers.json on reboot
  // using info from a discord message  
  tiktokpinger.importTikTokers(bot);

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
// disable this so all errors will return a strack trace to herokus logs
/*
bot.on('error', (error) => {
  console.error(`Shit\'ts broken fam ${error}}`);
});
*/

// this stops heroku from disabling my dynamo from no traffic
setInterval(() => {
  request.get('http://fuck-zach.herokuapp.com');
}, 900000);

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
