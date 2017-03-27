//module.exports = commands;

exports.commands = {
  "commandname": {
    func: function (message, args) {
      message.channel.sendMessage("command/channel reply");
    }

  },
  "hi": {
    func: function (message, args) {
      message.channel.sendMessage("Heyo You're Gayo!");
    }
  }

};