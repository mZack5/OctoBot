'use strict';

const dbFile = 'digitaldb.json'
const fs = require('fs');
const fileLoader = require('./tools/fileLoader');

const dOcean = require('do-wrapper').default;
const api = new dOcean(process.env.digitaltoken, 100);

const cf = require('cloudflare')({
  email: process.env.cloudemail,
  key: process.env.cloudtoken
});

module.exports.run = async (message, args, command, bot) => {
  let db, config;
  try {
    db = JSON.parse(fs.readFileSync(dbFile));
    config = JSON.parse(fs.readFileSync('./config.json'));
  } catch (err) {
    return message.channel.send(`Error! Issue loading config files, please try the command again in a few seconds.`);
  }

  if (message.author.id !== config.bot_owner && message.author.id !== '139465047704469504') {
    return message.channel.send(`Error! You don't have permission to use this command`);
  }
  if (!args.length) return message.channel.send('first modifier should be [start] or [stop]');

  switch (args[0].toLowerCase()) {
    case 'start':
      if (fs.existsSync(`./digital.lock`)) {
        return message.channel.send(`Error! Lockfile found, did you just run the stop command?`);
      }

      await message.channel.send('Searching for the latest snapshot').then(msg => {
        db.droplet.msg_id = msg.id;
        db.droplet.msg_chan = message.channel.id;
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
      });
      await fileLoader.exportFile(bot, dbFile);


      try {
        await mainStart(bot, db);
      } catch (err) {
        return message.channel.send(`<@185513703364362240> Error! ${JSON.stringify(err, null, 2)}`);
      }

      console.log('Created a droplet');
      break;

    case 'stop':
      if (!fs.existsSync(`./digital.lock`)) {
        message.channel.send(`Command locked, please run this command again to verify you have: 
      1: ran the command /save-all
      2: ran the command /backup start
      3: ran the command /stop`);
        return fs.closeSync(fs.openSync('./digital.lock', 'a'));
      }
      // delete the lockfile
      fs.unlinkSync('./digital.lock');

      await message.channel.send('Shutdowning down the server!').then(msg => {
        db.droplet.msg_id = msg.id;
        db.droplet.msg_chan = message.channel.id;
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
      });

      try {
        await mainStop(bot, db);
      } catch (err) {
        return message.channel.send(`<@185513703364362240> Error! ${JSON.stringify(err, null, 2)} \n(if this error occured while the droplet was snapshotting, try running -do delete after 8 minutes)`)
      }
      await cleanDB(bot, db);
      console.log('deleted a droplet');
      break;

    case 'ip':
      const droplets = await api.dropletsGetAll();
      if (droplets.body.droplets.length !== 1) return message.channel.send(`Error! No Droplets are running!`);
      if (!db.droplet.id) return message.channel.send(`Error! Droplet id not found in database :thinking:`);

      const ip = await api.dropletsGetById(db.droplet.id);
      message.channel.send(`Current IP Address: \`\`\`${ip.body.droplet.networks.v4[0].ip_address}\`\`\` `)
      break;

    case 'delete':
      const droplet = await api.dropletsGetAll();
      if (droplet.body.droplets.length !== 1) return message.channel.send(`Error! No Droplets are running!`);
      if (!db.droplet.id) return message.channel.send(`Error! Droplet id not found in database :thinking:`);

      const status = await api.dropletsGetById(db.droplet.id)
      if (status.body.droplet.snapshot_ids.length > 0) {
        await api.dropletsDelete(db.droplet.id);
        await cleanDB(bot, db);
        return message.channel.send(`Droplet Deleted!, Droplet status checked and returned X > 0 snapshots`);
      } else {
        return message.channel.send(`Error! The droplet I tried to delete doesn't have any snapshots. Please use the -do stop command instead.`);
      }
      break;

    default:
      message.channel.send(`fat fingered the command eh?`);
      break;
  }
}

// this function should:
// - check that there's not already a running droplet
// - get the latest snapshot
// - start a droplet using that snapshot
async function mainStart(bot, db) {
  const droplets = await api.dropletsGetAll();
  // droplets.body.droplets is an array of all existing droplets, empty if none exist
  if (droplets.body.droplets.length !== 0) {
    return bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
      msg.edit(`Error! There's already a droplet running!`);
    });
  }

  const snapshots = await api.snapshotsDroplets();

  const latest_snap = snapshots.body.snapshots.pop();
  await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
    msg.edit(`Latest snapshot found! Creating server! Snapshot size: ${latest_snap.size_gigabytes} GB`);
    console.log(`Trying to create server using snapshot_id: ${latest_snap.id}!`)
  });

  // https://developers.digitalocean.com/documentation/v2/#create-a-new-droplet
  // we create an options Object, using options that digitalOcean requires
  const dropletOptions = {
    name: 'testDroplet',
    region: 'lon1',
    size: 's-2vcpu-4gb',
    image: latest_snap.id,
    ssh_keys: ['07:18:b1:aa:ba:7c:61:e3:92:1f:cf:74:82:6c:06:f3']
  };
  // we create a droplet, and store the returned response in `info` so we can save the droplet id
  const info = await api.dropletsCreate(dropletOptions);
  db.droplet.id = info.body.droplet.id;
  db.droplet.name = info.body.droplet.name;
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  await fileLoader.exportFile(bot, dbFile);

  let ip;
  while (true) {
    await sleep(2000);
    ip = await api.dropletsGetById(db.droplet.id);

    if (ip.body.droplet.networks.v4.length) {
      ip = ip.body.droplet.networks.v4[0].ip_address;
      break;
    }
  }

  await updateCloudflare(ip);

  await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
    msg.edit(`Droplet created! Please use \`\`\`minecraft.zodkoy.com\`\`\` to connect.`);
  });
}

// this function should:
// - check to make sure there's only 1 droplet running
// - shutdown that droplet gracefully
// - snapshot the droplet
// - delete the droplet only when we are 100% sure it has been snapshotted
async function mainStop(bot, db) {
  const droplets = await api.dropletsGetAll();

  // this checks for running droplets
  if (droplets.body.droplets.length !== 1) {
    return bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
      msg.edit('Error! No droplets are currently running.');
    });
  }
  // send a shutdown command
  await api.dropletsRequestAction(db.droplet.id, {
    type: 'shutdown'
  });

  let checked_shutdown = 0;
  // this runs untill the server sends back an IPv4 address
  while (true) {
    await sleep(2000);
    let status = await api.dropletsGetById(db.droplet.id);
    if (status.body.droplet.status === 'off') break;
    checked_shutdown++;
    if (checked_shutdown % 2 === 0) {
      bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit(`Shutdowning down the server! Checked: ${checked_shutdown} times`);
      });
    }
  }

  // send a snapshot command
  const snapshot = await api.dropletsRequestAction(db.droplet.id, {
    type: 'snapshot'
  });

  await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
    msg.edit(`Droplet has been shutdown and a snapshot was started! Please give this a few minutes to complete.`);
  });
  let checked_snap = 0;
  // this runs and checks for when a snapshot is finished. Usually takes 5+ minutes
  while (true) {
    await sleep(15000);
    checked_snap++;
    let data = await api.dropletsGetAction(db.droplet.id, snapshot.body.action.id);
    if (data.body.action.status === 'completed') break;
    bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
      msg.edit(`Droplet has been shutdown and a snapshot was started! Please give this a few minutes to complete. Checked: ${checked_snap} times`);
    });
  }

  await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
    msg.edit(`Droplet Snapshot finished! I'm gonna check a few things before I delete the server.`);
  });

  // here we're going to check the info about a droplet, to make sure it has a snapshot id before we destroy it.  
  const status = await api.dropletsGetById(db.droplet.id);
  if (status.body.droplet.snapshot_ids.length > 0) {
    // we can delete the server here
    await api.dropletsDelete(db.droplet.id);
    await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
      msg.edit(`Droplet Deleted!
Checked ${checked_shutdown} times, if the server shutdown, 2000 mill inc
Checked ${checked_snap} times, if Snapshot finished, 15000 mill inc
It took ${checked_shutdown * 2} Seconds to shutdown the server, and ${(checked_snap * 15) / 60} Minutes to snapshot the server.`);
    });
  } else {
    // we should edit the message and say error
    await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
      msg.edit(`<@185513703364362240> Error! tried to delete a droplet that hasn't been snapshoted. Aborting.`);
    });
  }
}


async function updateCloudflare(ip) {
  return new Promise(async (resolve) => {
    const zones = await cf.zones.browse();
    const id = zones.result.find(name => name.name === 'zodkoy.com').id;
    const dns_records = await cf.dnsRecords.browse(id);
    const record = dns_records.result.find(name => name.name === `minecraft.zodkoy.com`).id;
    const newRecord = {
      type: 'A',
      name: 'minecraft.zodkoy.com',
      content: ip,
      ttl: 120
    };
    const response = await cf.dnsRecords.edit(id, record, newRecord);
    return resolve(response.success ? true : false);
  });
}

async function cleanDB(bot, db) {
  return new Promise(async resolve => {
    db.droplet.id = 0;
    db.droplet.name = '';
    db.droplet.msg_id = '';
    db.droplet.msg_chan = '';
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    await fileLoader.exportFile(bot, dbFile);
    return resolve();
  });
}

function sleep(time_ms) {
  return new Promise(resolve => {
    setTimeout(resolve, time_ms)
  });
}

module.exports.help = {
  name: 'do',
  help: '[start] or [stop] or [ip] or [delete]'
}