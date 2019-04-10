'use strict';
const fs = require('fs');
const tiktokpinger = require('./tools/tiktokPinger');
const checkIfLive = require('./tools/checkIfLive');
const fileLoader = require('./tools/fileLoader');
const name = require('./tools/getUserName');

module.exports.run = async (message, args, command, bot) => {
    // this command is ment to add tiktokers to tiktokers.json

    // this checks if the user has a role called Admin or Moderator, or if its me running the command
    if (!message.member.roles.some(r => ["Admin", "Moderator"].includes(r.name))) {
        if (message.author.id.toString() !== '185513703364362240') {
            return message.channel
                .send(`Error! You need the role 'Admin' or 'Moderator' to use this command.`);
        }
    }
    // this checks if the given command was just: `-tiktokers`
    if (!args.length) return message.channel.send('first modifier should be [add] or [list] or [update]');

    // this loads the tiktokers file and handles errors for if it contains bad data or file was not found 
    try {
        var users = JSON.parse(fs.readFileSync('./tiktokers.json'));
    } catch (err) {
        console.log(`typeoferr: ${typeof err} Err: ${err}`);
        message.channel.send(`if you're reading this, something fucked up really bad`);
        console.error('issue loading the tiktokers.json file in the tiktok command');
    }
    // this gets us an array of all userNames in tiktokers.json
    const allUserNames = Object.keys(users);

    switch (args[0].toLowerCase()) {

        case 'add':
            // this checks if we have the correct number of arguments
            if (args.length !== 2) return message.channel.send('Error! Format change! New format is: !live add [user_id]');

            // we use .then on this function so we don't need to inject the bot
            // dependency into the function
            addUser(users, allUserNames, args[1], message.id, message.channel.id).then((data) => {
                message.channel.send(data);
            }).catch((err) => {
                console.log(`(tiktok): Error: ${err}`);
                message.channel.send('An error occurred, try running the command again.');
            });
            break;

        case 'update':
            message.channel.send('Updating!');
            tiktokpinger.checkIfNewVideos(bot);

            break;

        case 'delete':
            // we're here if we should delete X input'ed user
            return console.log('on hold currently');
            if (args[1] == undefined) {
                return message.channel.send('Error! I need to know who to delete!');
            }

            for (let user in allUserNames) {
                //console.log(users[allUserNames]);

                if (userNames[allUserNames].toLowerCase() == args[1].toLowerCase()) {
                    // we're here if the given input shows that the user exists in tiktokers.json
                    delete users[userNames[allUserNames]];
                    fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
                    fileLoader.exportFile(bot, 'tiktokers.json');
                    return message.channel.send(`Deleted user: ${args[1]}`)
                }
            }
            message.channel.send(`Error! User: ${args[1]} not found`);
            break;

        case 'list':
            let description = [];

            for (let i = 0; i < allUserNames.length; i++) {
                description.push(allUserNames[i] + '\n')
            }
            message.channel.send({
                'embed': {
                    'title': 'Currently giving notifications for:',
                    'description': description.join(''),
                    'color': 1325771
                }
            });
            break;

        case 'updatett':
            message.channel.send('Updating the users using local tiktokers.json');
            fileLoader.exportFile(bot, 'tiktokers.json');

            break;

        case 'updateconfig':
            message.channel.send('Updating the users using local config.json');
            fileLoader.exportFile(bot, 'config.json');

            break;

        case 'dump':
            message.channel.send({
                files: ['./tiktokers.json']
            });
            break;

        case 'live':
            message.channel.send('Refreshing who\'s live!');
            checkIfLive.checkIfLive(bot);
            break;


        case 'code':
            if (fs.existsSync(`./baddata${args[1]}.json`)) {
                message.channel.send({
                    files: [`./baddata${args[1]}.json`]
                });
            } else return message.channel.send(`Couldnt find that file`);
            break;

        default:
            return message.channel.send('Unexpected first modifier, should be: [add] or [dump]');
    }
}
// async function addUser(users, user_id, allUsers, msg_id, chan_id) {
async function addUser(users, allUsers, user_id, msg_id, chan_id) {
    // this function will handle all of our logic for adding a user

    // this tries to get the userName of the user_id
    try {
        var userName = await name.getUserName(user_id);
    } catch (err) {
        return Promise.resolve(`Encountered an error getting the username of ${user_id}, seems like an incorrect user_id.`);
    }

    // this checks if the user_id already exists in our db, as we NEVER want to duplicate user_id's in our db
    const userExists = allUsers.find(user => user_id === users[user].userID);

    // userExists is a string if the user_id in our db, and `undefined` if its not
    if (userExists) {
        // if user_id is in the db, we check for if the api received userName is in the db, or if the user changed their name 
        if (allUsers.find(user => userName === user)) {
            // this checks if the chan_id is already in the channels array for said user
            if (users[userName].channels.find(channel => channel === chan_id)) {
                // we're here if: user_id in db, user has correct userName, chan_id already in channels [] 
                return Promise.resolve(`This channel is already receiving notifications for ${userName}!`);
            } else {
                // we're here if: user_id in db, user has correct userName, chan_id is not in channels []
                // if the user exists, but the chan_id isnt getting notifications, we push the chan_id to the channels array
                users[userName].channels.push(chan_id);
                fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
                return Promise.resolve(`This channel will now receive notifications for ${userName}!`);
            }
        } else {
            // we're here if: user_id in db, user has the wrong userName
            users[userName] = users[userExists];
            delete users[userExists];
            fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
            // this checks if the chan_id is already in the channels array for said user
            if (users[userName].channels.find(channel => channel === chan_id)) {
                // we're here if: user_id in db, user ha(d) the wrong userName, chan_id already in channels []
                return Promise.resolve(`This channel is already receiving notifications for ${userName}!`);
            } else {
                // we're here if: user_id in db, user ha(d) the wrong userName, chan_id is not in channel []
                users[userName].channels.push(chan_id);
                fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
                return Promise.resolve(`This channel will now receive notifications for ${userName}!`)
            }
        }
    } else {
        // we're here if: the userName AND user_id don't exist in the db
        console.log(`Added new user into the database! name: ${userName}`);
        users[userName] = {
            last_post: '',
            userID: user_id,
            isLive: 0,
            live_msg: [],
            channel: [msg_id]
        };
        fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
        return Promise.resolve(`This channel will now receive notifications for ${userName}!`)
    }
}

module.exports.help = {
    name: 'tiktok',
    help: '[list/update/add/delete] (username) (postID (17-20 char))'
}