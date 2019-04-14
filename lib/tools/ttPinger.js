'use strict';

const fs = require('fs');
const request = require('request-promise-native');
const fileLoader = require('./fileLoader');
const JSONbig = require('json-bigint');
const id = require('./getRandomDID')

const usersFile = 'tiktokers.json';
const configFile = 'config.json';


/**
 * TEMP FIX
 */
// this is so we only update the db once
let usersFileUpdated = false;
// if a user's last video was deleted, and that is the video_id we're checking
// then we will get an error. we use this var to only update last_post once
let updateLastPost_aftererr = false;



async function checkIfLive(bot) {
   console.log(`Checked livestream data`);

   try {
      var users = JSON.parse(fs.readFileSync(usersFile));
      var config = JSON.parse(fs.readFileSync(configFile));
   } catch (err) {
      console.error('Error importing files in livestreaming, skipping current loop');
      return;
   }

   const log_channel = config.log_channel;
   const urls = await returnLinks(users, 'detail');
   const data = await getPostInfo(urls);
   const room_ids = await handleJSON(data, 'detail');
   let i = 0;

   // this for-in loop will handle the interface between the script and the bot
   for (const user in users) {
      // if we get an error, we will alert it here
      if (room_ids[i] === 'error') {
         // we already logged data about the error in the handPostData() function
         bot.channels.get(log_channel).send(`(Livestreaming): ive encountered an error with ${user}`);

         // TEMP FIX
         handleNewPosts(bot);

         // continue: skips current loop itteration, without stopping the loop
         i++;
         continue;
      }

      // we do a check to see if room_ids is undefined (edge case)
      if (room_ids[i] === undefined) {
         console.log(`(Livestreaming): ${user} has returned an undefined room_id`);
         bot.channels.get(log_channel).send(`(Livestreaming): Error! ${user} has returned an undefined room_id`);

         // continue: skips current loop itteration, without stopping the loop         
         i++;
         continue;
      }

      // if room_id is NOT 0, and we DIDNT know they were live before
      if (room_ids[i] !== 0 && users[user].isLive === 0) {
         console.log(`${user} is live! roomid: ${room_ids[i]}`);

         // this is a weird work around
         const room_id = room_ids[i].toString();

         // since each user can have more than 1 channel to message, we store
         // each live_msg sent as an object with the message.id and channel.id

         // we can't use an array to store the msg_id and corrolate that to the
         // channel array in the dbFile, because discord's api will resolve
         // promises in a random order, not related to which message was sent first
         let embed;
         try {
            embed = await embedBuilder(room_id);
         } catch (err) {
            console.error(`(Livestreaming:embed): Data is undefined`);
            i++;
            continue;
         }
         for (let i = 0; i < users[user].channels.length; i++) {
            bot.channels.get(users[user].channels[i]).send(embed).then((msg) => {
               // bot.channels.get(users[user].channels[i]).send(`If you're reading this, ${user} is live!\nhttps://m.tiktok.com/share/live/${room_id}`).then((msg) => {
               users[user].live_msgs.push({
                  id: msg.id,
                  chan: msg.channel.id
               });
               users[user].isLive = 0;
               fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
               handleUsersFile(bot);
            });
         }
      }

      // if isLive == 1. BUT room_id == 0; then the user WAS live, but isnt anymore
      if (room_ids[i] === 0 && users[user].isLive === 1) {
         console.log(`${user} is no longer live!`);

         // delete the previous message saying the user was live
         for (let i = 0; i < users[user].live_msgs.length; i++) {
            bot.channels.get(users[user].live_msgs[i].chan).fetchMessage(users[user].live_msgs[i].id)
               .then(msg => {
                  msg.delete();
               });
         }

         // set the user to NOT be live, and set the live_msg parameter to blank
         users[user].isLive = 0;
         users[user].live_msgs = [];

         fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
         handleUsersFile(bot);
      }
      i++;
   }
}

async function checkIfNewVideos(bot) {
   console.log(`Made a request to TikTok's website`);

   try {
      var users = JSON.parse(fs.readFileSync(usersFile))
      var config = JSON.parse(fs.readFileSync(configFile))
   } catch (err) {
      console.error('Error importing files in tiktokpinger, skipping current loop');
      return;
   }

   const urls = await returnLinks(users, 'post');
   const data = await getPostInfo(urls);
   const video_ids = await handleJSON(data, 'post');
   const log_channel = config.log_channel;
   let updated = false;
   let i = 0;
   for (const user in users) {

      if (video_ids[i] === 'error') {
         console.error(`(tiktokpinger): I've encourted an issue with ${user}`);
         i++;
         continue;
      }

      if (video_ids[i] === undefined) {
         console.log(`(tiktokpinger): ${user} has returned an undefined video_id`);
         bot.channels.get(log_channel).send(`(tiktokpinger): Error! ${user} has returned an undefined video_id`);
      }

      if (video_ids[i] !== users[user].last_post) {
         console.log(`${user} has new videos! OldVideoID: ${users[user].last_post} NewVideoID: ${video_ids[i]}`);

         // if (users[user].last_post !== '') {
         //    bot.channels.get(config[user].channel).send(`<@185513703364362240> ${user} has uploaded new videos!`);
         // } else {
         //    bot.channels.get('388168215366336516').send(`${user} has been silently updated`);
         // }
         updated = true;
         users[user].last_post = video_ids[i];
      }
      i++;
   }
   if (updated) {
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      handleUsersFile(bot);
   }
}


// this function will create URLs from given aweme_ids
async function returnLinks(users, endPoint) {
   const device_id = await id.getRandomDID();
   if (endPoint === 'live') return users.map(key => `https://api2.musical.ly/aweme/v1/room/enter/?room_id=${key}&source_type=1&ts=1555005938&js_sdk_version=&app_type=normal&manifest_version_code=2019040801&_rticket=1555005939687&app_language=en&iid=6675716395743250181&channel=beta&device_type=moto%20e5%20plus&language=en&account_region=AR&resolution=720*1358&openudid=3b06040976f96ab7&update_version_code=2019040801&sys_region=US&os_api=26&uoo=0&is_my_cn=0&timezone_name=America%2FArgentina%2FBuenos_Aires&dpi=272&carrier_region=AR&ac=wifi&device_id=${device_id}&pass-route=1&mcc_mnc=72207&os_version=8.0.0&timezone_offset=-10800&version_code=100809&carrier_region_v2=722&app_name=musical_ly&ab_version=10.8.9&version_name=10.8.9&device_brand=motorola&ssmix=a&pass-region=1&device_platform=android&build_number=10.8.9&region=US&aid=1233&as=a1d5484a227f9ce15f8466&cp=85f4cd532df6ac1ee1KoSw&mas=0192aba222d1e75b9fe202b1ba324ccba36c6c2c1c66ac8ca6c69c`)
   if (endPoint === 'post') return Object.keys(users).map(key => `https://api2.musical.ly/aweme/v1/aweme/post/?max_cursor=0&user_id=${users[key].userID}&count=15&retry_type=no_retry&mcc_mnc=311480&app_language=en&language=en&region=US&sys_region=US&carrier_region=US&carrier_region_v2=&build_number=10.7.1&timezone_offset=-18000&timezone_name=America%2FNew_York&is_my_cn=0&fp=FlTrLrTZcMPZFl5MLrU1LSFeFSKe&account_region=US&pass-region=1&pass-route=1&device_id=${device_id}&ac=wifi&channel=googleplay&aid=1233&app_name=trill&version_code=513&version_name=5.1.3&device_platform=android&ab_version=10.7.1&ssmix=a&device_type=Pixel+2+XL&device_brand=google&os_api=28&os_version=9&openudid=a2a1b01532e4dca8&manifest_version_code=2019040234&resolution=1440*2737&dpi=476&update_version_code=2019040234&_rticket=1554982589726&ts=1554982589&as=a1iosdfgh&cp=androide1`)
   if (endPoint === 'detail') return Object.keys(users).map(key => `https://api2.musical.ly/aweme/v1/aweme/detail/?&aweme_id=${users[key].last_post}&device_id=${device_id}&channel=googleplay&aid=1233&app_name=musical_ly&version_code=100400&version_name=10.4.0&device_platform=android&ab_version=10.4.0&ssmix=a&device_type=Pixel+2+XL&device_brand=google&os_api=28&os_version=9`);
}

// this function will return a promise once we have received all data from all urls
async function getPostInfo(urls, method) {
   return new Promise((resolve) => {

      let headers = {
         'User-Agent': 'com.zhiliaoapp.musically/2019031132 (Linux; U; Android 9; en_US; Pixel 2 XL; Build/PQ2A.190305.002; Cronet/58.0.2991.0)',
      }

      // if method = live, we need extra headers
      // if we add these for all requests, detail and post requests fail.
      if (method === 'live') {
         headers['X-Tt-Token'] = '0312761fdb087d159b3a6f31a5e848ee0aeb7db7a776aefa8a52ad7589ea3366932eb585632e1881bea9ece44ab11e62b32b';
         headers['sdk-version'] = 1;
      }

      const returnedPromises = urls.map(everyURL => request({
         uri: everyURL,
         headers: headers,
         json: false
      }).catch((error) => {
         console.error(`(TikTokAPI): Error! request to url: ${eachURL} failed \nError: ${error}`);
      }));

      // we only resolve the getPostInfo promise once all request promises are resolved
      Promise.all(returnedPromises).then((data) => {
         // we are using a 3rd party JSON parser, so we parse every response here
         let parsed_data = data.map(data => JSONbig.parse(data));
         return resolve(parsed_data);
      });
   });
}

async function handleJSON(data, endPoint) {
   let ids = [];
   for (let i = 0; i < data.length; i++) {
      try {
         if (endPoint === 'live') {
            ids[i] = {
               pull_url: data[i].room.stream_url.rtmp_pull_url,
               title: data[i].room.title,
               name: data[i].room.owner.unique_id,
               id: data[i].room.room_id,
               avatar: data[i].room.owner.avatar_larger.url_list[0]
            }
         }
         if (endPoint === 'detail') ids[i] = data[i].aweme_detail.author.room_id;
         if (endPoint === 'post') ids[i] = data[i].aweme_list[0].aweme_id;
      } catch (err) {
         // this is error handling for if we have received bad data
         ids[i] = 'error';
         // lets save some bad data so we can better understand it
         let fileExtra = Math.random().toString(36).substring(2, 15);
         fs.writeFileSync(`./baddata${fileExtra}.json`, JSON.stringify(data[i], null, 2));
         console.error(`(TikTokAPI): API returned bad data\nMethod: ${endPoint} DataCode: ${fileExtra} Error: ${err}`);
      }
   }
   return Promise.resolve(ids);
}

async function embedBuilder(room_id) {
   // this imports randomcolor, makes a random color in hex, then converts it into base10
   const color = parseInt(require('randomcolor').randomColor().substring(1), 16);

   // we get data for the embed
   const url = await returnLinks([room_id], 'live');
   const info = await getPostInfo(url, 'live');
   // because of the way handleJSON works, data is an array, idk how to fix this
   let data = await handleJSON(info, 'live');
   if (data[0] === undefined) {
      return Promise.reject('Bad data returned')
   }
   return Promise.resolve({
      'embed': {
         'title': `${data[0].name} just went live on TikTok!`,
         'description': `${data[0].title}`,
         'color': color,
         'thumbnail': {
            'url': data[0].avatar
         },
         'fields': [{
               'name': 'Watch the stream:',
               'value': `[Watch on TikTokAPI.ga](https://tiktokapi.ga/live/live.php?room_id=${data[0].id})
              [Watch on Mobile](https://m.tiktok.com/share/live/${data[0].id})`
            },
            {
               'name': 'Record the stream:',
               'value': `\`\`\`${data[0].pull_url}\`\`\``
            }
         ]
      }
   });
}

function handleUsersFile(bot) {
   // this function:
   // - is ment to be called whenever we have a reason to update the db
   // - should only update the db once per calling the function checkIfLive()
   // - should be able to be called 100 times, and only ever update the db once

   setTimeout(() => {
      if (!usersFileUpdated) {
         usersFileUpdated = true;
         console.log('(Livestreaming): Updated tiktokers.json');
         fileLoader.exportFile(bot, 'tiktokers.json')
      }
   }, 15000);
}

function handleNewPosts(bot) {
   /**
    * TEMP FIX
    */
   setTimeout(() => {
      if (!updateLastPost_aftererr) {
         updateLastPost_aftererr = true;
         console.log('(Livestreaming): Trying to fix error by updating last_post for all users');
         checkIfNewVideos(bot);
      }
   }, 15000);
}

module.exports = {
   checkIfLive,
   checkIfNewVideos
}