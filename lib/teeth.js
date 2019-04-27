'use strict';
const fs = require('fs');
const fileLoader = require('./tools/fileLoader');

module.exports.run = async (message, args, command, bot) => {
    const teeth = JSON.parse(fs.readFileSync('./teeth.json'));

    if (!args.length) return message.channel.send(teeth.brush[Math.floor(Math.random() * Math.floor(teeth.brush.length))]);

    switch (args[0].toLowerCase()) {
        case 'add':
            args.shift();
            teeth.brush.push(args.join(' '));
            fs.writeFileSync('teeth.json', JSON.stringify(teeth, null, 2));
            fileLoader.exportFile(bot, 'teeth.json');
            message.channel.send('Added!');
            break;

        case 'update':
            message.channel.send('Updating teeth.json using local teeth.json');
            fileLoader.exportFile(bot, 'teeth.json');
            break;

        case 'dump':
            message.channel.send({
                files: ['./teeth.json']
            });
            break;

        default:
            return message.channel.send(`first argument should be [add] if you're wanting to add some more messages`);
    }
}

module.exports.help = {
    name: 'teeth',
    help: 'Sends a random \'brush your teeth!\' message, use -teeth add [message] to add another message'
}