import { readFileSync } from 'fs';
import { Message } from 'discord.js';
import { importFile } from './utils/fileLoader';
import { bot } from './utils/bot';
import { checkRequired } from './utils/required';
import {
   ConfigOptions, Command, CommandFunction, DiscordEmbedReply,
} from './typings/interfaces';

// make sure env vars are set!
if (!checkRequired()) throw new Error('Error! Enviorment Variables not set!');

// functions which will be loaded after discord imports the db
let startTimers: () => void;

// variables to store our command map, help embed, and possible bot Actions
let commands: Map<string, number | Command>;
let commandsEmbed: DiscordEmbedReply;

// when discord says its ready, we import our db and config, and then load the commands
bot.on('ready', async (): Promise<void> => {
   console.log('Discord Client ready!');

   // this is to load Various files on boot and set runtime vars
   try {
      await importFile(`${process.env.configFile}.json`);
   } catch (error) {
      console.error(new Error('Error! Error importing (mandatory) boot files!'));
      process.exit(1);
   }

   // read the config and set the prefix
   const config: ConfigOptions = JSON.parse(readFileSync(`./${process.env.configFile}.json`).toString());
   process.env.prefix = config.prefix as string;

   // import commandhandler.ts, which will import all the files in the commands folder
   // which will export the commandMap and the help embed
   const { createCommandsMap, createHelpEmbed } = await import('./utils/commandhandler');
   commands = await createCommandsMap();
   commandsEmbed = createHelpEmbed();

   // starts our autoupdate timers
   ({ startTimers } = await import('./utils/timers'));
   startTimers();


   // set the game on boot
   if (config.gameUrl === '') {
      bot.user.setActivity(config.game, { type: config.gameState });
   } else bot.user.setActivity(config.game, { type: config.gameState, url: config.gameUrl });
});

// function to handle any message that anyone sends
bot.on('message', (message: Message): void => {
   if (message.author.bot) return;
   if (message.channel.type !== 'text'
      && message.author.id !== process.env.botOwner) {
      message.react('🤔');
      return;
   }
   if (message.content.startsWith(process.env.prefix as string)) {
      const messageArguments = message.content.slice((process.env.prefix as string).length).split(' ');
      const command = messageArguments.shift() as string;
      const commandFunc: CommandFunction = commands.get(command) as Command;
      commandFunc(message, messageArguments);
      if (command === 'help') {
         message.react('📬');
         message.author.send(commandsEmbed);
      }
   } else if (message.content.substring(1, 7) === 'prefix') {
      message.channel.send(`My prefix is currently ${process.env.prefix}`);
   }
});

bot.login(process.env.discordToken);
