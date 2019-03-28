'use strict';

const fs = require('fs');
const request = require('request-promise-native');


/**
 * So i want this to be a file that checks tiktoks api
 * every X or Y minutes past the hour, and checks recent PostIDs
 * against old PostIDs to see if Z tiktoker has new uploads.
 * if so: it should ping me in my test discord server
 * if not: then do nothing - DONE
 * 
 * it should have a command to add tiktokers to the list
 *  using tiktoker add ID_here - DONE
 * 
 * 
 */

function checkIfNewVideos(bot) {
    // old url: https://tiktokapi.ga/php/jsonpst.php?uid={user id}&count=1
    // new url: https://t.tiktok.com/aweme/v1/aweme/post/?user_id={user id}&count=5&_signature=1

    let config = JSON.parse(fs.readFileSync('./lib/src/tiktokers.json'));
    let log = JSON.parse(fs.readFileSync('./lib/src/log.json'));

    let urls = [];
    for (const ids in config) {
        urls.push('https://t.tiktok.com/aweme/v1/aweme/post/?user_id=' + config[ids].userID + '&count=5&_signature=1');
    }

    // runs request(example.com) for every URL, and returns all the given results into an 
    // array called arrOfPromiseData. Each request might start/end at different times
    // so we only use the data after every request is returned, using Promise.all()
    console.log(`Made a request to TikTok's website`);
    const arrOfPromiseData = urls.map(eachURL => request({
        uri: eachURL,
        headers: {
            'User-Agent': 'aweme'
        },
        json: true
    }).catch((err) => {
        // this is error handling for if we have an issue GETing the data from a link
        log.log.push(`Error with: ${eachURL}, at: ${Date()}`);
        fs.writeFileSync('./lib/src/log.json', JSON.stringify(log, null, 2));
        bot.channels.get('388168215366336516').send(`${eachURL} Errored out, returned bad data or status code != 200`);
    }));

    let newVidids = [];
    Promise.all(arrOfPromiseData).then((returnedData) => {
        for (let k = 0; k < returnedData.length; k++) {
            try {
                newVidids[k] = returnedData[k].aweme_list[0].aweme_id;
            } catch (err) {
                // this is error handling for if we have received bad data
                let badUsers = Object.keys(config);
                newVidids[k] = 'error';
                bot.channels.get('388168215366336516').send(`<@185513703364362240> ive encountered an error with ${badUsers[k]} \n ${err}`);
                // TODO: A lot more logging so I better understand why it fails sometimes
            }
        }

        let i = 0;
        for (const user in config) {
            // console.log(`UserName: ${user} NewVidID: ${newVidids[i]} oldVidID: ${config[user].last_post}`);

            if (newVidids[i] == 'error') {
                // log some data
                log.log.push(`${user} has errored out at ${Date()}`);
                fs.writeFileSync('./lib/src/log.json', JSON.stringify(log, null, 2));

                // continue: skips current loop itteration but doesnt break; it
                continue;
            }
            if (newVidids[i] != config[user].last_post) {
                // we're here if we have new videos

                // we're gonna log some data, to help diagnose issues
                // this just adds a string to log.json, which can be dumped using -tiktok dump2
                log.log.push(`${user} has new videos, OldVideoID: ${config[user].last_post} NewVideoID: ${newVidids[i]}`);
                fs.writeFileSync('./lib/src/log.json', JSON.stringify(log, null, 2));

                // we shouldnt alert about new updates if last_post is ''
                if (config[user].last_post != '') {
                    // now we need to send an update to a channel about the videos:
                    bot.channels.get('262283539469434912').send(`<@185513703364362240> ${user} has uploaded new videos!`);
                } else {
                    bot.channels.get('388168215366336516').send(`${user} has been silently updated`);
                }
                // now we need to update the JSON file with the new information:
                config[user].last_post = newVidids[i];
                fs.writeFileSync('./lib/src/tiktokers.json', JSON.stringify(config, null, 2));

                // now we'll call a function that saves tiktokers.json to a discord message
                // so we can use it to load values on reboot
                // since heroku remakes a dyno's entire file system every 24hrs
                // this is a ghetto fix for that.


                //saveTikTokers(bot);
                // we will just duplicate code for now, because i dont wanna fix this right now.
                exportTikTokers(bot);
                // bot.channels.get('554477335395696649').fetchMessage('554488826727497728')
                //     .then(message => {
                //         message.edit(JSON.stringify(config));
                //     });
            } else {
                // we're here if we have no new videos
                //console.log(`UserName: ${user} has no new videos!`);
            }

            i++;
        }
    });
}

// this function is meant to pull data from a discord message on boot
// and then store the data received to a local file
function importTikTokers(bot) {
    bot.channels.get('554477335395696649').fetchMessage('554488826727497728')
        .then(msg => {
            console.log(`Loaded tiktokers from discord message => disk`)
            fs.writeFileSync('./lib/src/tiktokers.json', JSON.stringify(JSON.parse(msg), null, 2));
        });
}

// this function is meant to take data from a local file
// and save it to a Discord message
function exportTikTokers(bot) {
    let config = JSON.parse(fs.readFileSync('./lib/src/tiktokers.json'));
    bot.channels.get('554477335395696649').fetchMessage('554488826727497728')
        .then(message => {
            message.edit(JSON.stringify(config));
        });
}

module.exports = {
    exportTikTokers,
    importTikTokers,
    checkIfNewVideos
}