"use strict";

// const request = require('request');
const fs = require('fs');
const request = require('request-promise');



/**
 * So i want this to be a file that checks tiktokapi.ga
 * every X or Y minutes past the hour, and checks recent PostIDs
 * against old PostIDs to see if Z tiktoker has new uploads.
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
    const arrOfPromiseData = urls.map(eachURL => request({
        uri: eachURL,
        json: true
    }).catch((err) => {
        bot.channels.get('388168215366336516').send(`ive encountered an error with ${eachURL}`);
    }));

    let newVidids = [];
    Promise.all(arrOfPromiseData).then((returnedData) => {
        console.log(`hello world`);
        for (let k = 0; k < returnedData.length; k++) {
            //parsedData[k] = JSON.parse(returnedData[k]);
            // take out the important part of the data
            try {
                newVidids[k] = returnedData[k].aweme_list[0].aweme_id;
            } catch (err) {
                let badUsers = Object.keys(config);
                newVidids[k] = "error";
                bot.channels.get('388168215366336516').send(`<@185513703364362240> ive encountered an error with ${badUsers[k]}`);
            }
        }

        let i = 0;
        for (const user in config) {

            // console.log(`UserName: ${user} NewVidID: ${newVidids[i]} oldVidID: ${config[user].last_post}`);
            if (newVidids[i] == "error") continue; // continue: skips current loop itteration but doesnt break; it
            if (newVidids[i] != config[user].last_post) {
                // we're here if we have new videos

                //we're gonna log some data, to help diagnose issues
                // this just adds a string to log.json, which can be dumped using -tiktok dump2
                let log = JSON.parse(fs.readFileSync('./lib/src/log.json'))
                log.log.push(`${user} has new videos, OldVideoID: ${config[user].last_post} NewVideoID: ${newVidids[i]}`);
                fs.writeFileSync('./lib/src/log.json', JSON.stringify(log, null, 2));


                // now we need to send an update to a channel about the videos:
                bot.channels.get('262283539469434912').send(`<@185513703364362240> ${user} has uploaded new videos!`);

                // now we need to update the JSON file with the new information:
                config[user].last_post = newVidids[i];
                fs.writeFileSync('./lib/src/tiktokers.json', JSON.stringify(config, null, 2));
            } else {
                // we're here if we have no new videos
                //console.log(`UserName: ${user} has no new videos!`);
            }

            i++;
        }
    });
}