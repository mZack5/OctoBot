import { Message } from 'discord.js';
import {
   readFileSync, existsSync, closeSync,
   openSync, unlinkSync, writeFileSync,
} from 'fs';
import {
   ConfigOptions, DropletOptions, Zone,
   DnsResult,
   Snapshot,
} from '../typings/interfaces';
import { exportFile } from '../utils/fileLoader';
import { logger } from '../utils/logger';
import { dOcean } from '../utils/digitalocean';
import { cFlare } from '../utils/cloudflare';

function sleep(timeMs: number): Promise<void> {
   return new Promise(resolve => {
      setTimeout(resolve, timeMs);
   });
}

function createDOConfig(snapshotId: string): DropletOptions {
   // https://developers.digitalocean.com/documentation/v2/#create-a-new-droplet
   // we create an options Object, using options that digitalOcean requires
   return {
      name: 'testDroplet',
      region: 'lon1',
      size: 's-2vcpu-4gb',
      image: snapshotId,
      ssh_keys: ['07:18:b1:aa:ba:7c:61:e3:92:1f:cf:74:82:6c:06:f3'],
   };
}

async function updateCloudflare(ip: string): Promise<boolean> {
   const zones = await cFlare.getAllZones();
   console.log(`getAllZones: zones\n${JSON.stringify(zones, null, 2)}`);
   const { id } = zones.result.find(name => name.name === 'zodkoy.com') as Zone;
   const allDnsRecords = await cFlare.getDnsForZone(id);
   console.log(`getDnsForZone: allDnsRecords\n${JSON.stringify(allDnsRecords, null, 2)}`);
   const mcRecord = allDnsRecords.result.find(name => name.name === 'mc.zodkoy.com') as DnsResult;
   const newRecord = {
      type: 'A',
      name: 'mc.zodkoy.com',
      content: ip,
      ttl: 120,
   };
   const response = await cFlare.updateDnsZone(id, mcRecord.id, newRecord);
   console.log(`updateDnsZone: Response\n${JSON.stringify(response, null, 2)}`);
   return response.success;
}

// this function should:
// - check that there's not already a running droplet
// - get the latest snapshot
// - start a droplet using that snapshot
async function mainStart(message: Message, botConfig: ConfigOptions): Promise<void> {
   const config = botConfig;
   console.log(`Config:\n${JSON.stringify(config, null, 2)}`);
   const msg = await message.channel.send('Searching for the latest snapshot') as Message;

   config.droplet.messageId = msg.id;
   config.droplet.channelId = msg.channel.id;
   writeFileSync(`${process.env.configFile}.json`, JSON.stringify(config, null, 2));
   exportFile(`${process.env.configFile}.json`);

   const { droplets } = await dOcean.getAllDroplets();
   console.log(`getAllDroplets: Droplets\n${JSON.stringify(droplets, null, 2)}`);
   // droplets is an array of all existing droplets, empty if none exist
   if (droplets.length !== 0) {
      await msg.edit('Error! There\'s already a droplet running!');
      return;
   }

   const { snapshots } = await dOcean.getSnapshots();
   console.log(`getSnapshots: snapshots: \n${JSON.stringify(snapshots, null, 2)}`);
   const latestSnapshot = snapshots.pop() as Snapshot;
   await msg.edit(`Latest snapshot found! Creating server! Snapshot size: ${latestSnapshot.size_gigabytes} GB`);
   const dropletConfig = createDOConfig(latestSnapshot.id);

   const newDroplet = await dOcean.createDroplet(dropletConfig);
   console.log(`createDroplet: newDroplet: \n${JSON.stringify(newDroplet, null, 2)}`);
   config.droplet.id = newDroplet.droplet.id;
   config.droplet.name = newDroplet.droplet.name;
   writeFileSync(`${process.env.configFile}.json`, JSON.stringify(config, null, 2));
   await exportFile(`${process.env.configFile}.json`);

   let ip = '';
   do {
      // eslint-disable-next-line no-await-in-loop
      const { droplet } = await dOcean.getDropletById(config.droplet.id);
      console.log(`getDropletByID: droplet\n\n${JSON.stringify(droplet, null, 2)}`);
      if (droplet.networks.v4.length) {
         ip = droplet.networks.v4[0].ip_address;
         break;
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(2000);
   } while (!ip);
   await updateCloudflare(ip);
   await msg.edit('Droplet created! Please use ```mc.zodkoy.com``` to connect.');
}

// this function should:
// - check to make sure there's only 1 droplet running
// - shutdown that droplet gracefully
// - snapshot the droplet
// - delete the droplet only when we are 100% sure it has been snapshotted
async function mainStop(message: Message, botConfig: ConfigOptions): Promise<void> {
   const msg = await message.channel.send('Shutting down the server!') as Message;
   const { droplets } = await dOcean.getAllDroplets();
   console.log(`getAllDroplets: Droplets\n${JSON.stringify(droplets, null, 2)}`);

   // this checks for running droplets
   if (droplets.length !== 1) {
      msg.edit('Error! No droplets are currently running.');
      return;
   }
   // send a shutdown command
   await dOcean.runDropletAction(botConfig.droplet.id, 'shutdown');

   let timesCheckedStatus = 0;
   do {
      // eslint-disable-next-line no-await-in-loop
      await sleep(2000);
      // eslint-disable-next-line no-await-in-loop
      const { droplet } = await dOcean.getDropletById(botConfig.droplet.id);
      console.log(`getDropletByID: droplet\n\n${JSON.stringify(droplet, null, 2)}`);
      if (droplet.status === 'off') break;
      timesCheckedStatus += 1;
      if (timesCheckedStatus % 2 === 0) {
         msg.edit(`Shutting down the server! Checked: ${timesCheckedStatus} times`);
      }
   } while (timesCheckedStatus > 0);

   // send a snapshot command
   const snapshotAction = await dOcean.runDropletAction(botConfig.droplet.id, 'snapshot');
   msg.edit('Droplet has been shutdown and a snapshot was started! Please give this a few minutes to complete.');

   let timesCheckedSnap = 0;
   // this runs and checks for when a snapshot is finished. Usually takes 5+ minutes
   do {
      // eslint-disable-next-line no-await-in-loop
      await sleep(15000);
      // eslint-disable-next-line no-await-in-loop
      const { action } = await dOcean.getDropletAction(snapshotAction.action.id);
      console.log(`getDropletAction: action(in-loop):\n\n${JSON.stringify(action, null, 2)}`);
      if (action.status === 'completed') break;
      timesCheckedSnap += 1;
      msg.edit(`Droplet has been shutdown and a snapshot was started! Please give this a few minutes to complete. Checked ${timesCheckedSnap} times`);
   } while (timesCheckedSnap > 0);

   msg.edit('Droplet Snapshot finished! I\'m gonna check a few things before I delete the server.');

   const status = await dOcean.getDropletById(botConfig.droplet.id);
   if (status.droplet.snapshot_ids.length) {
      await dOcean.deleteDroplet(botConfig.droplet.id);
      msg.edit(`Droplet Deleted! It took ${timesCheckedStatus * 2} Seconds to shutdown the server, and ${((timesCheckedSnap * 15) / 60)} Minutes to take a snapshot.`);
   } else {
      msg.edit('Error! Droplet returned snapshot finished but returned no snapshot_ids, Doing nothing and aborting.');
   }
}

async function dropletGetIp(message: Message, config: ConfigOptions): Promise<string | void> {
   const { droplets } = await dOcean.getAllDroplets();
   if (droplets.length !== 1) {
      const errMessage = (droplets.length > 1) ? 'Error! Multple Dropets Running!' : 'Error! No Droplets are running!';
      message.channel.send(errMessage);
      return;
   }
   if (!config.droplet.id) {
      message.channel.send('Droplet ID not found in database :thinking:');
      return;
   }
   const status = await dOcean.getDropletById(config.droplet.id);
   message.channel.send(`Current IP Address \`\`\`${status.droplet.networks.v4[0].ip_address}\`\`\` `)
}

export default async (message: Message, args: string[]): Promise<void> => {
   let config: ConfigOptions;
   try {
      config = JSON.parse(readFileSync(`${process.env.configFile}.json`).toString());
   } catch (e) {
      message.channel.send('Err! Couldnt load config file.');
      logger.error('default::do', e);
      return;
   }

   if (!config.admins.includes(message.author.id)) {
      message.channel.send('Error! You don\'t have permission to use this command');
      return;
   }

   if (!args.length) {
      message.channel.send('first modifier should be [start] or [stop]');
      return;
   }

   switch (args[0].toLowerCase()) {
      case 'start':
         if (existsSync('./digital.lock')) {
            message.channel.send('Error! Lockfile found, did you just run the stop command?');
            return;
         }
         mainStart(message, config);
         break;

      case 'stop':
         if (!existsSync('./digital.lock')) {
            message.channel.send(`Command locked, please run this command again to verify you have: 
         1: ran the command /save-all
         2: ran the command /backup start
         3: ran the command /stop`);
            closeSync(openSync('./digital.lock', 'a'));
            return;
         }
         // delete the lockfile
         unlinkSync('./digital.lock');
         await mainStop(message, config);
         break;

      case 'ip':
         await dropletGetIp(message, config);
         break;

      default:
         message.channel.send('fat fingered the command eh?');
         break;
   }
};

export const help = {
   name: 'do',
   help: '[start] or [stop] or [ip] or [delete]',
};
