'use strict';
module.exports.run = async (message, args, command, bot) => {
    message.channel.send('Pong!');
}

module.exports.help = {
    name: 'ping',
    help: 'Responds with Pong!'
}