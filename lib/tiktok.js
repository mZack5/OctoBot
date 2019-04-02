'use strict';
const fs = require('fs');
const tiktokpinger = require('./tools/tiktokPinger');
module.exports.run = async (message, args, command, bot) => {
    // this command is ment to add tiktokers to tiktokers.json
    // -tiktok add userName, UserID 

    let config = JSON.parse(fs.readFileSync('./lib/tools/tiktokers.json'));
    const users = Object.keys(config);

    if (args.length > 0) {
        switch (args[0].toLowerCase()) {

            case 'add':
                // this checks if we have the correct number of arguments
                if (args.length != 3) return message.channel.send('Invaild amount of arguments, expected: [Name] [UserID]');

                // this checks is someone with the same UserName already exists
                for (let i = 0; i < users.length; i++) {
                    if (args[1].toLowerCase() == users[i].toLowerCase()) {
                        return message.channel.send(`Error! Username ${args[1]} is already receiving notifications`);
                    }
                }
                // this checks to make sure the given ID is the correct length
                let userID = args[2].match(/[0-9]{17}/);
                if (!userID || args[2].toString().length > 20) return message.channel.send('UserID is an invaild number of digits');

                // this checks if someone with the same userID already exists
                for (let tiktokers in config) {
                    if (config[tiktokers].userID == args[2]) {
                        return message.channel.send(`Error! User with the ID ${args[2]} already exists!`);
                    }
                }

                // if we're here: we know that userID is only numbers, and is the correct length
                // and no one with the same username, or the same ID, exists
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

            case 'delete':
                // we're here if we should delete X input'ed user

                if (args[1] == undefined) {
                    return message.channel.send('Error! I need to know who to delete!');
                }
                const userNames = Object.keys(config)

                for (let users in userNames) {
                    //console.log(config[users]);

                    if (userNames[users].toLowerCase() == args[1].toLowerCase()) {
                        // we're here if the given input shows that the user exists in tiktokers.json
                        delete config[userNames[users]];
                        fs.writeFileSync('./lib/tools/tiktokers.json', JSON.stringify(config, null, 2));
                        tiktokpinger.exportTikTokers(bot);
                        return message.channel.send(`Deleted user: ${args[1]}`)
                    }
                }
                message.channel.send(`Error! User: ${args[1]} not found`);
                break;

            case 'list':
                let description = [];

                for (let i = 0; i < users.length; i++) {
                    description.push(users[i] + '\n')
                }
                message.channel.send({
                    "embed": {
                        "title": "Currently giving notifications for:",
                        "description": description.join(''),
                        "color": 1325771
                    }
                });
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

            default:
                return message.channel.send('Unexpected first modifier, should be: [add] or [dump]');
        }
    } else return message.channel.send('first modifier should be [add] or [list] or [update]');
}
module.exports.help = {
    name: 'tiktok',
    help: '[list/update/add/delete] (username) (postID (17-20 char))'
}