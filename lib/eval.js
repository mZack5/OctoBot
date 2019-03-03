"use strict";

let fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json'));


module.exports.run = async (message, args, command, bot) => {
  if (message.author.id == config.bot_owner) {
    console.log('Eval command was used');
    try {
      const code = args.join(" ");
      let evaled = eval(code);
      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
      }
      message.channel.send(evaled);
      //    message.channel.send(evaled, { code: "xl" });
    } catch (err) {
      message.channel.send(`Error! ${err}`);
    }

  }
}

module.exports.help = {
  name: 'eval',
  help: 'you can\'t use this'
}