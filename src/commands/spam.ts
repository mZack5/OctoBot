import { Message } from 'discord.js';
import { bot } from '../utils/bot';

export default async (message: Message, args: string[]): Promise<void> => {
   if (message.guild.member(bot.user).hasPermission('MANAGE_MESSAGES')) {
      if (args.length > 0) {
         message.delete();
         [1, 2, 3, 4, 5].map(() => message.channel.send(args.join(' ')));
      } else {
         const msg = await message.channel.send('Can\'t spam nothing!') as Message;
         msg.delete(3000);
      }
   } else {
      const msg = await message.channel.send('Only admins can use this command!') as Message;
      msg.delete(3000);
   }
};

module.exports.help = {
   name: 'spam',
   help: 'spams a message 5 times',
};
