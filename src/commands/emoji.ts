import { Message } from 'discord.js';
import { } from 'fs';
import { logger } from '../utils/logger';

export default async (message: Message, args: string[]): Promise<void> => {
   if (!args[0]) {
      message.channel.send('Expected inputs are [add] (url) or [delete] (name) or [update] (old name) (new name)');
      return;
   }
   switch (args[0].toLowerCase()) {
      case 'add':
         // we should probably do some checking for if the url is valid
         if (!args[2]) {
            message.channel.send('Error! Emoji name should be after the url!');
            return;
         }
         try {
            await message.guild.createEmoji(args[1], args[2], undefined, 'if ur reading this, ur mom gay');
            message.channel.send(`Emoji created! With name: ${args[2]}!`);
         } catch (e) {
            logger.error('default::emoji', e);
         }
         break;

      case 'delete':
         if (args[1]) {
            const emojiToDelete = message.guild.emojis.find(emoji => emoji.name === args[1]);
            if (emojiToDelete) {
               try {
                  await message.guild.deleteEmoji(emojiToDelete);
                  message.channel.send('Emoji deleted!');
               } catch (e) {
                  logger.error('default::emoji', e);
               }
            } else {
               message.channel.send('Error! I couldn\'t find that emoji, please type out the name of the emoji\nI can\'t delete emoji literals yet (. _  .)');
            }
         } else {
            message.channel.send('Error! Which emoji should I delete? :thinking:');
         }
         break;

      case 'rename':
         message.channel.send('this doesnt fucking work');
         // if (args[1] == undefined) return message.channel.send('Error! Which emoji should I rename?');
         // if (args[2] == undefined) return message.channel.send('Error! What should I rename the emoji to?');

         // let emojiToRename = message.guild.emojis.find(emoji => emoji.name === args[1]);
         // if (emojiToRename) {
         //    emojiToRename.setName(args[2])
         //       .then(message.channel.send(`Emoji edited!`))
         //       .catch((error) => {
         //          message.channel.send(`error renaming emoji \n${error}`)
         //       });
         // } else return
         // message.channel.send(`Error! I couldn't find that emoji, please type out
         // the name of the emoji\nI can't delete emoji literals yet (. _  .)`);
         break;

      default:
         break;
   }
};

export const help = {
   name: 'emoji',
   help: '[add] (url) (name) or [delete] (name) or [rename] (name)',
};
