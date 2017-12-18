"use strict";
const Discord = require('discord.js');
const bot = new Discord.Client();
// const commands = require('./lib/commands.js').commands;
const fs = require('fs');

let config = JSON.parse(fs.readFileSync('./config.json'));
let token = config.discord_token;
bot.prefix = config.prefix;
bot.commands = new Discord.Collection;

fs.readdir('./lib/', (err, files) => {
  if (err) console.error(err);
  let jsfiles = files.filter(f => f.split('.').pop() === 'js');
  if (jsfiles.length <= 0) {
    console.log('somethings wrong bud');
    return;
  }
  console.log(`loading ${jsfiles.length} commands`);

  jsfiles.forEach((f, i) => {
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
      console.log(`messageArguemnts is ${messageArguments}`);
      func.run(message, messageArguments, command, bot);
    }
    // else if here to list commands
    // else if here to say unknown command
  } else if (command == 'prefix') {
    message.channel.send(`My prefix is currently ${bot.prefix}`);
  }
});
bot.login(token);
