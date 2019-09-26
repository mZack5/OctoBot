import { readdirSync } from 'fs';
import randomColor from 'randomcolor';
import { Command, DiscordEmbedReply } from '../typings/interfaces';

// var to cache all the command files
let cmdFiles: Command[];

// loads all the cmdFiles at boot, and caches them
async function loadFiles(): Promise<void> {
   const filepromises: Promise<Command>[] = [];
   const files = readdirSync('./dist/commands')
      .filter(f => f.endsWith('.js'));
   for (const file of files) {
      filepromises.push(import(`../commands/${file}`));
   }
   cmdFiles = await Promise.all(filepromises);
}

// creates the map that holds our commands
export async function createCommandsMap(): Promise<Map<string, Command>> {
   // since we ALWAYS run this function first, we can treat it as an init function
   await loadFiles();
   const botCommands = new Map();

   try {
      for (const command of cmdFiles) {
         botCommands.set(command.help.name, command.default);
      }
   } catch (e) {
      console.error('Error importing commands, malformed command file!');
      process.exit(1);
   }
   return botCommands;
}

// creates the help embed
export function createHelpEmbed(): DiscordEmbedReply {
   if (!cmdFiles) {
      console.error(new Error('Error! Failed to create help embed, did you load the files first?'));
      process.exit(1);
   }
   const commandDesc: string[] = [];
   for (const command of cmdFiles) {
      if (command.help.help) {
         commandDesc.push(`**${process.env.prefix}${command.help.name}**: ${command.help.help}\n`);
      }
   }
   const color = parseInt((randomColor() as string).substring(1), 16);
   return {
      embed: {
         color,
         title: 'My Commands!',
         description: commandDesc.join(' '),
      },
   };
}
