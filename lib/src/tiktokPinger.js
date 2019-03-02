"use strict";

// const request = require('request');
const fs = require('fs');
const request = require('request-promise');



/**
 * So i want this to be a file that checks tiktokapi.ga
 * every 10 minutes or so, and checks if theres new tiktoks
 * compared to the last time it checked
 * if so: it should ping me in my test discord server
 * if not: then do nothing
 * 
 * it should have a command to add tiktokers to the list
 *  using tiktoker add ID_here
 * 
 * 
 */

exports.checkIfNewVideos = (bot) => {
    // https://tiktokapi.ga/php/jsonpst.php?uid={user id}&count=1

    let config = JSON.parse(fs.readFileSync('./lib/src/tiktokers.json'));

    let urls = [];
    for (const ids in config) {
        urls.push('https://tiktokapi.ga/php/jsonpst.php?uid=' + config[ids].userID + '&count=1');
    }

    // runs request(example.com) for every URL, and returns all the given results into an 
    // array called arrOfPromiseData. Each request might start/end at different times
    // so we only use the data after every request is returned, using Promise.all()
    const arrOfPromiseData = urls.map(eachURL => request(eachURL));

    let parsedData = [];
    let newVidids = [];

    Promise.all(arrOfPromiseData).then((returnedData) => {
        for (let k = 0; k < returnedData.length; k++) {
            parsedData[k] = JSON.parse(returnedData[k]);
            // take out the important part of the data
            newVidids[k] = parsedData[k].aweme_list[0].aweme_id;
        }

        let i = 0;
        for (const keys in config) {

            // console.log(`UserName: ${keys} NewVidID: ${newVidids[i]} oldVidID: ${config[keys].last_post}`);

            if (newVidids[i] != config[keys].last_post) {
                // we're here if we have new videos
                // now we need to send an update to a channel about the videos:
                bot.channels.get('262283539469434912').send(`<@185513703364362240> ${keys} has uploaded new videos!`);

                // now we need to update the JSON file with the new information:
                config[keys].last_post = newVidids[i];
                fs.writeFileSync('./lib/src/tiktokers.json', JSON.stringify(config, null, 2));
            } else {
                // we're here if we have no new videos
                //console.log(`UserName: ${keys} has no new videos!`);
            }

            i++;
        }
    });
}