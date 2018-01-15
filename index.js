"use strict";
const Discord = require('discord.js');
const bot = new Discord.Client();
const path = require("path");
const express = require('express');
const app = express();

const Music = require('./lib/src/discord-music');
const fs = require('fs');
const port = process.env.PORT || 5000;
let config = JSON.parse(fs.readFileSync('./config.json'));

bot.prefix = config.prefix;
bot.commands = new Discord.Collection;

// set the view engine to ejs
//app.set('view engine', 'ejs');

// make express look in the `public` directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', (request, response) => {
    // ejs render automatically looks in the views folder
    response.sendFile(path.join(__dirname+'/views/index.html'));
});

app.listen(port, () => {
  // will echo 'Our app is running on http://localhost:5000 when run locally'
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
  bot.user.setGame(config.game);
});

bot.on("message", function messageRecived(message) {
  if (message.author.bot === true) return;
  if (message.channel.type !== 'text') return message.channel.send('fuck outta my DMs boi');

  let messageArguments = message.content.slice(bot.prefix.length).split(" ");
  messageArguments.shift();
  let command = message.content.slice(bot.prefix.length).split(" ").shift();
  let func = bot.commands.get(command);

  if (message.content.startsWith(bot.prefix)) {
    if (func) {
      func.run(message, messageArguments, command, bot);
    } else if (command == 'commands') {
      let cmd_names = [];
      bot.commands.forEach((objects, names) => {
        // console.log(names);
        cmd_names.push(names);
      });
     message.channel.send(cmd_names);
    }
    // else if here to list commands
    // else if here to say unknown command
  } else if (command == 'prefix') {
    message.channel.send(`My prefix is currently ${bot.prefix}`);
  }
});

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
  helloWorld: false
});

setInterval(() => {
  http.get('http://fuck-zach.herokuapp.com');
}, 900000);

bot.login(process.env.discordtoken);