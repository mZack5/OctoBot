

exports.commands = {
  "commands": {
    func: function (message, args) {
//  TODO: Make command print commands from object commands in lib/commands.js
      message.channel.sendMessage([
          "TODO: fix this shitty commands array",
          "!hi",
          "!commands"
        ]);
    }

  },
  "hi": {
    func: function (message, args) {
      message.channel.sendMessage("Heyo You're Gayo!");
    }
  },
  "github": {
      func: function (message, args) {
          message.channel.sendMessage("You can find the repo for me at: https://github.com/mZack5/OctoBot");
      }
  }
};