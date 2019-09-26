import { Message } from 'discord.js';

export default (message: Message): void => {
   message.channel.send('Pong!');
};

module.exports.help = {
   name: 'ping',
   help: 'Responds with Pong!',
};
