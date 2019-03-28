"use strict";
const fs = require('fs');

module.exports.run = async (message, args, command, bot) => {
    const teeth = JSON.parse(fs.readFileSync('./lib/tools/teeth.json'));
    if (args.length > 0) {
        switch (args[0].toLowerCase()) {
            case "add":
                args.shift();
                teeth.brush.push(args.join(' '));
                fs.writeFileSync('./lib/tools/teeth.json', JSON.stringify(teeth, null, 2))
                message.channel.send(`Added!`);
                break;

            case "dump":
                message.channel.send({
                    files: ['./lib/tools/teeth.json']
                });
                break;

            default:
                return message.channel.send(`first argument should be [add] if you're wanting to add some more messages`);
        }
    } else {
        // we're here if the command is just -teeth 
        message.channel.send(teeth.brush[Math.floor(Math.random() * Math.floor(teeth.brush.length))]);
    }
}

module.exports.help = {
    name: 'teeth',
    help: 'Sends a random \'brush your teeth!\' message, use -teeth add [message] to add another message'
}