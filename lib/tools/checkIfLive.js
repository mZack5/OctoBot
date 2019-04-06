'use strict';

const fs = require('fs');
const request = require('request-promise-native');
const fileLoader = require('./fileLoader');
var configUpdated = false;

async function checkIfLive(bot) {
   console.log(`Checked livestream data`);

   try {
      var users = JSON.parse(fs.readFileSync('./tiktokers.json'));
      // TODO: use log_channel from config
      // var config = JSON.parse(fs.readFileSync('./config.json'));
   } catch (err) {
      console.log('Error reading users in livestreaming, skipping this loop');
      return;
   }

   const urls = await returnLinks(users);
   const data = await getPostInfo(urls);
   let room_ids = await handlePostData(data);

   let i = 0;
   // this for-in loop will handle the interface between the script and the bot
   for (const user in users) {

      // if we get an error, we will alert it here
      if (room_ids[i] === 'error') {
         // we already logged data about the error in the handPostData() function

         const d = new Date();
         const dateString = `0${d.getMonth() + 1}-0${(d.getDate())}-${d.getFullYear()} 0${d.getHours()}:${d.getMinutes()}`;
         bot.channels.get('388168215366336516')
            .send(`ive encountered an error with ${Object.keys(users)[i]} at ${dateString}`);

         // we add 1 to i because we will skip the current loop, which would stop i from getting updated normally
         i++;

         // continue: skips current loop itteration, without stopping the loop
         continue;
      }

      // if room_id is NOT 0, and we DIDNT know they were live before
      if (room_ids[i] !== 0 && users[user].isLive === 0) {
         console.log(`${user} is live! roomid: ${room_ids[i]}`);

         bot.channels.get(users[user].channel).send(`If you're reading this, ${user} is live!`).then((msg) => {
            users[user].live_msg = msg.id;
            users[user].isLive = 1;

            fs.writeFileSync('./tiktokers.json', JSON.stringify(users, null, 2));
            handleConfigUpdate(bot);
         });


         // if isLive == 1. BUT room_id == 0; then the user WAS live, but isnt anymore
      } else if (room_ids[i] === 0 && users[user].isLive === 1) {
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
         handleConfigUpdate(bot);
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
      let betterID = (Math.floor(Math.random() * 9) + 1).toString();
      // id length must be between 19 and 15 chars
      const len = (Math.floor(Math.random() * 4) + 15);

      for (let i = 0; i < len; i++) {
         // append a random number to the end of betterID
         betterID += Math.floor(Math.random() * 10);
      }
      resolve(betterID);
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
         json: true
      }).catch((error) => {
         console.error(`(Livestreaming): Error! Getting Livestream data failed! ${eachURL} at ${Date()}`);
         bot.channels.get('388168215366336516').send(`${eachURL} (LiveStream) Errored out, returned bad data or status code != 200`);
      }));

      // we only resolve the getPostInfo promise once all request promises are resolved
      Promise.all(returnedPromises).then((data) => {
         resolve(data);
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
            console.error(`(LiveStreaming): Error: \n${err}`);
            // we should alert later in the main function
         }
      }
      resolve(room_ids)
   });
}

function handleConfigUpdate(bot) {
   // this function:
   // - is ment to be called whenever we have a reason to update the db
   // - should only update the db once per calling the function checkIfLive()
   // - should be able to be called 100 times, and only ever update the db once

   setTimeout(() => {
      if (!configUpdated) {
         configUpdated = true;
         console.log('(Livestreaming): Updated the config');
         fileLoader.exportFile(bot, 'tiktokers.json')
      }
   }, 10000);
}

module.exports = {
   checkIfLive
}