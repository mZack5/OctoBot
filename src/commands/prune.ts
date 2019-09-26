import { Message } from 'discord.js';
import { bot } from '../utils/bot';

export default async (message: Message, args: string[] | number[]): Promise<void> => {
   // if the user who ran the account cannot delete messages we do nothing
   if (!message.member.hasPermission('MANAGE_MESSAGES')) return;
   // if the bot cannot delete messages, we do a warning
   if (!message.guild.member(bot.user).hasPermission('MANAGE_MESSAGES')) {
      const msg = await message.channel.send('I can\'t delete messages :thinking:') as Message;
      msg.delete(3000);
      return;
   }

   // if we're here, all permissions are correct
   // if the user left the first input blank, we do a warning

   if (!args[0]) {
      const msg = await message.channel.send('How much should I prune?') as Message;
      msg.delete(3000);
      return;
   }

   if (args[0] >= 2 && args[0] <= 100) {
      // we're here if all input is good and all permissions are correct
      await message.channel.bulkDelete(args[0] as number);
      const msg = await message.channel.send(`Pruned ${args[0]} messages!`) as Message;
      msg.delete(3000);
   }
};
export const help = {
   name: 'prune',
   help: '[2 - 100] or [@user] (2 - 100) or [user_id] (2 - 100)',
};
