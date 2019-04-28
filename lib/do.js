'use strict';

const dbFile = 'digitaldb.json'
const fs = require('fs');
const fileLoader = require('./tools/fileLoader');
const dOcean = require('do-wrapper').default;
const api = new dOcean(process.env.digitaltoken, 100);

module.exports.run = async (message, args, command, bot) => {

  try {
    var db = JSON.parse(fs.readFileSync(dbFile));
    var config = JSON.parse(fs.readFileSync('./config.json'));
  } catch (err) {
    return message.channel.send(`Error! Issue loading config files, please try the command again in a few seconds.`);
  }

  if (message.author.id !== config.bot_owner && message.author.id !== '139465047704469504') {
    return message.channel.send(`Error! You don't permission to use this command`);
  }
  if (!args.length) return message.channel.send('first modifier should be [start] or [stop]');

  const droplets = await getDroplets();
  switch (args[0].toLowerCase()) {
    case 'start':
      // we should:
      // - get the latest snapshot
      // - use that snapshot to start the server

      if (fs.existsSync(`./digital.lock`)) {
        return message.channel.send(`Error! Lockfile found, did you just run the stop command?`);
      }

      if (droplets.droplets.length !== 0) {
        return bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
          msg.edit(`Error! There's already a droplet running!`);
        });
      }

      await message.channel.send('Getting ready to start the server!').then(msg => {
        db.droplet.msg_id = msg.id;
        db.droplet.msg_chan = message.channel.id;
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
      });
      await fileLoader.exportFile(bot, dbFile);
      await sleep(1000);
      //const droplets = await getDroplets();
      await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit('Searching for the latest snapshot!');
      });
      const latest_id = await getLatestSnapshotId();

      await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit(`Latest snapshot found! Creating server using ${latest_id} as snapshot id!`);
      });

      console.log(`Trying to create server using snapshot_id: ${latest_id}!`)
      const info = await makeDroplet(latest_id);
      db.droplet.id = info.droplet.id;
      db.droplet.name = info.droplet.name;
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

      await sleep(4000);
      const ip = await getIP(db.droplet.id);

      await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit(`Droplet created! IP Address: ${ip} (Please give the server __and__ minecraft a few minutes to boot up).`);
      });
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

      await message.channel.send('Getting ready to stop/snapshot/delete the server!').then(msg => {
        db.droplet.msg_id = msg.id;
        db.droplet.msg_chan = message.channel.id;
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
      });

      // const droplets = await getDroplets();
      if (droplets.droplets.length !== 1) {
        return bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
          msg.edit('Error! No droplets are currently running.');
        });
      }

      await sleep(1000);

      await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit(`Trying to shutdown the droplet!`);
      });

      // this 1 function should NOT finish until the droplet is off.
      await shutdownDroplet(db.droplet.id);
      const snapshot = await snapshotDroplet(db.droplet.id);
      await sleep(1000);

      await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit(`Droplet has been shutdown and a snapshot was started! Please give this a few minutes to complete.`);
      });
      await snapshotFinished(snapshot.action.id, db.droplet.id);
      await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
        msg.edit(`Droplet Snapshot finished! I'm gonna check a few things before I delete the server.`);
      });
      // here we're going to check the info about a droplet, to make sure it has a snapshot id before we destroy it.
      await sleep(2000)
      const status = await getDropletStatus(db.droplet.id);
      // we want status.snapshot_ids
      if (status.snapshot_ids.length > 0) {
        // we can delete the server here
        await deleteDroplet(db.droplet.id);
        await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
          msg.edit(`Droplet Deleted!`);
        });
      } else {
        // we should edit the message and say error
        await bot.channels.get(db.droplet.msg_chan).fetchMessage(db.droplet.msg_id).then(msg => {
          msg.edit(`<@185513703364362240> Error! tried to delete a droplet that hasn't been snapshoted. Aborting.`);
        });
      }
      // we delete the lockfile
      fs.unlinkSync('./digital.lock');
      break;

    default:
      message.channel.send(`fat fingered the command eh?`);
      break;
  }


}
async function getDroplets() {
  return new Promise((resolve, reject) => {
    api.dropletsGetAll().then(data => {
      // with 0:
      // { droplets: [], links: {}, meta: { total: 0 } }
      return resolve(data.body);
    });
  });
}

async function getLatestSnapshotId() {
  const snapshots = await listSnapshots();
  // latest snapshot is always the last one in the `snapshots` array
  return new Promise((resolve) => {
    const latest_snapshot = snapshots.snapshots.pop();
    return resolve(latest_snapshot.id);
  });
}

async function listSnapshots() {
  return new Promise((resolve) => {
    api.snapshotsDroplets().then(data => {
      return resolve(data.body);
    })
  });
}

async function makeDroplet(id) {
  return new Promise((resolve, reject) => {
    const options = {
      name: 'testDroplet',
      region: 'lon1',
      size: 's-2vcpu-4gb',
      image: id,
      ssh_keys: ['07:18:b1:aa:ba:7c:61:e3:92:1f:cf:74:82:6c:06:f3']
    };
    api.dropletsCreate(options).then(data => {
      return resolve(data.body);
    });
  });
}

async function getDropletStatus(id) {
  return new Promise((resolve, reject) => {
    api.dropletsGetById(id).then(data => {
      return resolve(data.body.droplet);
    });
  });
}

async function getIP(id) {
  return new Promise((resolve, reject) => {
    api.dropletsGetById(id).then(data => {
      try {
        return resolve(data.body.droplet.networks.v4[0].ip_address);
      } catch (error) {
        console.log('Error in the getIP function');
      }
    });
  });
}

async function snapshotDroplet(id) {
  return new Promise((resolve, reject) => {
    const options = {
      type: 'snapshot',
    };
    api.dropletsRequestAction(id, options).then(data => {
      return resolve(data.body);
    });
  });
}

async function snapshotFinished(action_id, drop_id) {
  return new Promise(async (resolve, reject) => {
    let i = 0;
    while (true) {
      if (i > 60) {
        return reject('<185513703364362240> Error! Snapshot timeout limit exceeded. Aborting.')
      }
      const data = await getActionInfo(action_id, drop_id);
      if (data.action.status === 'completed') break;
      await sleep(10000);
    }
    return resolve();
  });
}

async function getActionInfo(action_id, drop_id) {
  return new Promise((resolve, reject) => {
    api.dropletsGetAction(drop_id, action_id).then(data => {
      return resolve(data.body);
    });
  });
}

async function shutdownDroplet(id) {
  await turnDropletOff(id);
  return new Promise(async (resolve) => {
    while (true) {
      const status = await getDropletStatus(id);
      if (status.status === 'off') break;
      await sleep(8000);
    }
    return resolve();
  });
}

async function turnDropletOff(id) {
  return new Promise((resolve) => {
    const options = {
      type: 'shutdown',
    };
    api.dropletsRequestAction(id, options).then(data => {
      return resolve(data.body);
    });
  });
}

async function deleteDroplet(id) {
  return new Promise((resolve) => {
    // we should do extensive error handling here first
    api.dropletsDelete(id).then(data => {
      return resolve(data.body);
    });
  });
}

function sleep(time_ms) {
  return new Promise(resolve => {
    setTimeout(resolve, time_ms)
  });
}

module.exports.help = {
  name: 'do',
  help: 'yeah this doesnt work anymore'
}