import { Message } from 'discord.js';
import { exportFile } from '../utils/fileLoader';
import { checkAdmin } from '../utils/checkAdmin';

// TODO: make some functions return values so we can print them out, see: logger
export default (message: Message, args: string[]): void => {
   if (!checkAdmin(message.author.id)) {
      message.react('❌');
      return;
   }

   switch (args[0].toLowerCase()) {
      case 'updateconfig':
         message.channel.send(`Updating ${process.env.configFile} using local version`);
         exportFile(`${process.env.configFile}.json`);
         break;

      case 'dumpconfig':
         message.channel.send({
            files: [`${process.env.configFile}.json`],
         });
         break;

      case 'addadmin':
         break;

      case 'deleteadmin':
         break;

      default:
         message.channel.send('Unknown admin command, did you forget them already?');
         break;
   }
};

export const help = {
   name: 'admin',
};
