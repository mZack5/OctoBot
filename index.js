"use strict";
const Discord = require('discord.js');
const bot = new Discord.Client();

const Music = require('./lib/src/discord-music');
const fs = require('fs');

let config = JSON.parse(fs.readFileSync('./config.json'));

try {
  let tokens = JSON.parse(fs.readFileSync('./tokens.json'));
  let discord_token = tokens.discord_token;
  let youtube_token = tokens.youtube_token;    
} catch (error) {
  // if we get to here, the code is (hopefully)
  // running on heroku, so we need to account for that
  let discord_token = process.env.discord_token;
  let youtube_token = process.env.youtube_token;
  // this should hopefully be everything we need right now
  // octotoken is broken but we dont talk about that
}

// console.log(`

// process.env.discord_token is ${process.env.discord_token}
// \n\
// process.env.youtube_token is ${process.env.youtube_token}
// \n\
// `);


bot.prefix = config.prefix;
bot.commands = new Discord.Collection;

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
  youtubeKey: youtube_token,
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

bot.login(discord_token);