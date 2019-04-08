'use strict';

const fs = require('fs');
const request = require('request-promise-native');
const fileLoader = require('./fileLoader');
const ttpinger = require('./tiktokPinger');
const JSONbig = require('json-bigint');



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
      var users = JSON.parse(fs.readFileSync('./tiktokers.json'));
      var config = JSON.parse(fs.readFileSync('./config.json'));
   } catch (err) {
      console.error('Error importing files in livestreaming, skipping current loop');
      return;
   }
   const log_channel = config.log_channel;
   const urls = await returnLinks(users);
   const data = await getPostInfo(urls);
   const room_ids = await handlePostData(data);
   let i = 0;

   // this for-in loop will handle the interface between the script and the bot
   for (const user in users) {

      // if we get an error, we will alert it here
      if (room_ids[i] === 'error') {
         // we already logged data about the error in the handPostData() function
         bot.channels.get(log_channel).send(`(Livestreaming): ive encountered an error with ${user}`);

         // TEMP FIX
         handleNewPosts(bot);

         // we add 1 to i because we will skip the current loop, which would stop i from getting updated normally
         i++;

         // continue: skips current loop itteration, without stopping the loop
         continue;
      }
      // we do a check to see if room_ids is undefined (edge case)
      if (room_ids[i] === undefined) {
         console.log(`(Livestreaming): ${user} has returned an undefined room_id`);
         bot.channels.get(log_channel).send(`(Livestreaming): Error! ${user} has returned an undefined room_id`);

         // continue: skips current loop itteration, without stopping the loop         
         continue;
      }

      // if room_id is NOT 0, and we DIDNT know they were live before
      if (room_ids[i] !== 0 && users[user].isLive === 0) {
         console.log(`${user} is live! roomid: ${room_ids[i]}`);

         bot.channels.get(users[user].channel).send(`If you're reading this, ${user} is live!\nhttps://m.tiktok.com/share/live/${room_ids[i]}`).then((msg) => {
            users[user].live_msg = msg.id;
            users[user].isLive = 1;

            fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
            handleUsersFile(bot);
         });


      }

      // if isLive == 1. BUT room_id == 0; then the user WAS live, but isnt anymore
      if (room_ids[i] === 0 && users[user].isLive === 1) {
         console.log(`${user} is no longer live!`);

         // delete the previous message saying the user was live
         bot.channels.get(users[user].channel).fetchMessage(users[user].live_msg)
            .then(msg => {
               msg.delete(1000);
            });

         // set the user to NOT be live, and set the live_msg parameter to blank
         users[user].isLive = 0;
         users[user].live_msg = '';

         fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
         handleUsersFile(bot);
      }
      i++;
   }
}

// this function will create URLs from given aweme_ids
async function returnLinks(users) {
   let device_id = await getRandomDID();
   return new Promise((resolve) => {
      // we make a blank array to store the URLs
      let urls = [];
      for (const ids in users) {
         urls.push(`https://api2.musical.ly/aweme/v1/aweme/detail/?&aweme_id=${users[ids].last_post}&device_id=${device_id}&channel=googleplay&aid=1233&app_name=musical_ly&version_code=100400&version_name=10.4.0&device_platform=android&ab_version=10.4.0&ssmix=a&device_type=Pixel+2+XL&device_brand=google&os_api=28&os_version=9`);
      }
      resolve(urls);
   });
}

// stands for: get random Device ID
async function getRandomDID() {
   return new Promise((resolve) => {
      // the first number can't be 0
      let id = (Math.floor(Math.random() * 9) + 1).toString();
      // id length must be between 19 and 15 chars
      const len = (Math.floor(Math.random() * 4) + 15);

      for (let i = 0; i < len; i++) {
         // append a random number to the end of id
         id += Math.floor(Math.random() * 10);
      }
      resolve(id);
   });
}

// this function will return a promise once we have received all data from all urls
async function getPostInfo(urls) {
   return new Promise((resolve) => {
      const returnedPromises = urls.map(everyURL => request({
         uri: everyURL,
         headers: {
            'User-Agent': 'com.zhiliaoapp.musically/2019031132 (Linux; U; Android 9; en_US; Pixel 2 XL; Build/PQ2A.190305.002; Cronet/58.0.2991.0)'
         },
         json: false
      }).catch((error) => {
         console.error(`(Livestreaming): Error! request to url: ${eachURL} failed`);
      }));

      // we only resolve the getPostInfo promise once all request promises are resolved
      Promise.all(returnedPromises).then((data) => {
         // we are using a 3rd party JSON parser, so we parse every response here
         let parsed_data = data.map(data => JSONbig.parse(data));
         resolve(parsed_data);
      });
   });
}

async function handlePostData(data) {
   return new Promise((resolve) => {
      let room_ids = [];
      for (let i = 0; i < data.length; i++) {
         try {
            room_ids[i] = data[i].aweme_detail.author.room_id;
         } catch (err) {
            // this is error handling for if we have received bad data
            room_ids[i] = 'error';
            console.error(`(LiveStreaming): API returned bad data: \n${err}`);
            // we should alert later in the main function
            // so, sometimes we get errors because the video's we're looking at get deleted
            // this isnt nice,

         }
      }
      resolve(room_ids)
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
   }, 10000);
}

function handleNewPosts(bot) {
   /**
    * TEMP FIX
    */
   setTimeout(() => {
      if (!updateLastPost_aftererr) {
         updateLastPost_aftererr = true;
         console.log('(Livestreaming): Trying to fix error by updating last_post for all users');
         ttpinger.checkIfNewVideos(bot);
      }
   }, 10000);
}

module.exports = {
   checkIfLive
}