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
        break;

      case "listening":
        config.game_state = "LISTENING";
        args.shift();
        config.game = args.join(' ');
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
          return;
        }
        config.game_state = "STREAMING";
        config.url = 'http://' + args[1];
        args.splice(0, 2);
        config.game = args.join(' ');
        break;

      default:
        config.game = args.join(' ');
        config.game_state = "PLAYING";
        break;
    }
    // this runs everytime the switch statement runs
    // this updates the game with all known info.
  //  setTimeout(updateActivity, 2000, config.game, config.url, config.game_state, bot, message);
    updateActivity(config.game, config.url, config.game_state, bot, message);

    // this line is called if you call the command
    // with nothing after it, fully removing the Activity.
  } else {
    config.game = "";
    config.game_state = "";
    config.url = "";
    updateActivity(config.game, config.url, config.game_state, bot, message);
  }
}

function updateActivity(game, url, type, bot, message) {
  bot.user.setActivity(game, {
    url: url,
    type: type
  });
  if (game == "" && url == "" && type == "") {
    message.delete();
    message.channel.send(`Removed game!`).then(msg => msg.delete(3000));
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    bot.user.setActivity(null);
    return;
  }
  message.delete();
  message.channel.send(`Updated to ${config.game_state.toLowerCase()}`).then(msg => msg.delete(3000));
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
console.log('updateActivity Finished!');
}


module.exports.help = {
  name: 'game'
}