'use strict';
const fs = require('fs');
const fileLoader = require('./tools/fileLoader');
const dbFile = 'config.json'

module.exports.run = async (message, args, command, bot) => {
    // this command is ment to add tiktokers to tiktokers.json

    // this checks if the given command was just: `-config`
    if (!args.length) return message.channel.send('dumb idiot');

    switch (args[0].toLowerCase()) {

        case 'update':
            message.channel.send('Updating Config using local config.json');
            fileLoader.exportFile(bot, dbFile);
            break;

        case 'dump':
            message.channel.send({
                files: [dbFile]
            });
            break;
 
        default:
            return message.channel.send('Unexpected first modifier, should be: [add] or [delete] or [list]');
    }
}

module.exports.help = {
    name: 'config',
    help: '[update]'
}