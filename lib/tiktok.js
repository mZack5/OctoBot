'use strict';
const fs = require('fs');
const tiktokpinger = require('./tools/tiktokPinger');
module.exports.run = async (message, args, command, bot) => {
    // this command is ment to add tiktokers to tiktokers.json
    // -tiktok add userName, UserID 

    let config = JSON.parse(fs.readFileSync('./lib/tools/tiktokers.json'));
    if (args.length > 0) {
        switch (args[0].toLowerCase()) {

            case 'add':
                if (args.length != 3) return message.channel.send('Invaild amount of arguments, expected: [Name] [UserID]');
                let userID = args[2].match(/[0-9]{17}/);

                if (!userID || args[2].toString().length > 20) return message.channel.send('UserID is an invaild number of digits');
                // if we're here: we know that userID is only numbers, and is the correct length
                // so now we can look at adding it into memory

                config[args[1]] = {
                    last_post: '',
                    userID: args[2]
                };
                fs.writeFileSync('./lib/tools/tiktokers.json', JSON.stringify(config, null, 2));
                tiktokpinger.exportTikTokers(bot);
                message.channel.send(`Added ${args[1]} using userid: ${args[2]}`);
                break;

                /** 
                 * so well this works, because this bot is loaded from a github repo
                 * none of these new tiktokers will be saved, which isnt fun
                 * I think to fix this i should use something like firebase, becasuse
                 * using herokus built in databases seems like hell, and they probably
                 * cost money, which is something i dont really have.
                 * 
                 * so as a quick fix, ill have a command that dumps the contents of 
                 * tiktokers.json, so i can just copy and paste it in the future.
                 * 
                 */
            case 'update':
                message.channel.send('Updating!');
                tiktokpinger.checkIfNewVideos(bot);

                break;
            case 'updateconfig':
                message.channel.send('Updating the config using local tiktokers.json');
                tiktokpinger.exportTikTokers(bot);

                break;
            case 'dump':
                message.channel.send({
                    files: ['./lib/tools/tiktokers.json']
                });
                break;

            case 'dumplog':
                message.channel.send({
                    files: ['./lib/tools/log.json']
                });
                break;

            default:
                return message.channel.send('Unexpected first modifier, should be: [add] or [dump]');
        }
    } else return message.channel.send('first modifier should be [add] or [dump]');
}
module.exports.help = {
    name: 'tiktok',
    help: 'tiktok [add/dump/update] [username] [postID (17-20 char)]'
}