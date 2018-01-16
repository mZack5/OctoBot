"use strict";
let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json'));

module.exports.run = async (message, args, command, bot) => {
  if (args.length > 0) {
    switch (args[0].toLowerCase()) {
      case "watching":
        config.game_state = "WATCHING";
        args.shift()
        config.game = args.join(' ');
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        message.delete();
        message.channel.send('Updated to Watching!').then(msg => msg.delete(3000));
        break;

      case "listening":
        config.game_state = "LISTENING";
        args.shift();
        config.game = args.join(' ');
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        message.delete();
        message.channel.send('Updated to Listening!').then(msg => msg.delete(3000));
        break;

      case "streaming":
        if (args.length > 1);
        // This part checks for a vaild URL, must be in
        // in the format twitch.tv/username
        let result = args[1].match('^twitch?(\.tv)?\/?');
        if (!result) {
          message.channel.send('Invaild url! Should be in the format: twitch.tv/channel!')
            .then(msg => msg.delete(3000));
          message.delete();
          break;
        }
        config.game_state = "STREAMING";
        config.url = 'http://' + args[1];
        console.log(config.url)
        args.shift();
        args.shift();
        config.game = args.join(' ');
        console.log(`config.game is ${config.game}`);
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        message.channel.send('Updated to Streaming!').then(msg => msg.delete(3000));
        message.delete();
        break;

      default:
        config.game = args.join(' ');
        config.game_state = "PLAYING";
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        message.delete();
        message.channel.send('Updated!').then(msg => msg.delete(3000));
        break;
    }
    // this runs everytime the switch statement runs
    // this updates the game with all known info.
    updateActivity(config.game, config.url, config.game_state, bot);
  
    // this line is called if you call the command
    // with nothing after it, fully removing the Activity.
  } else return updateActivity(null, null, null, bot);
}

module.exports.help = {
  name: 'game'
}

function updateActivity(game, url, type, bot) {
  bot.user.setActivity(game, {
    url: url,
    type: type
  });
}