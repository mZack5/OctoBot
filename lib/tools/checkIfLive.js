'use strict';

const fs = require('fs');
const request = require('request-promise-native');
const ttpinger = require('./tiktokPinger');

function checkIfLive(bot) {
    console.log(`Checked livestream data`);
    // url: `https://api2.musical.ly/aweme/v1/aweme/detail/?&aweme_id=${video_id}`;

    let config = JSON.parse(fs.readFileSync('./lib/tools/tiktokers.json'));

    let urls = [];
    for (const ids in config) {
        //if (config[ids] == null) {
            
        //}
        urls.push(`https://api2.musical.ly/aweme/v1/aweme/detail/?&aweme_id=${config[ids].last_post}`);
    }
    const arrOfPromiseData = urls.map(eachURL => request({
        uri: eachURL,
        headers: {
            'User-Agent': 'com.zhiliaoapp.musically/2019031132 (Linux; U; Android 9; en_US; Pixel 2 XL; Build/PQ2A.190305.002; Cronet/58.0.2991.0)'
        },
        json: true
    }).catch((err) => {
        // this is error handling for if we have an issue GETing the data from a link

        console.error(`Error! Getting Livestream data failed! ${eachURL} at ${Date()}`);
        bot.channels.get('388168215366336516').send(`${eachURL} (LiveStream) Errored out, returned bad data or status code != 200`);
    }));

    let room_ids = [];
    Promise.all(arrOfPromiseData).then((returnedData) => {
        for (let k = 0; k < returnedData.length; k++) {
            try {
                room_ids[k] = returnedData[k].aweme_detail.author.room_id;
            } catch (err) {
                // this is error handling for if we have received bad data
                const badUsers = Object.keys(config);
                room_ids[k] = 'error';
                bot.channels.get('388168215366336516').send(`<@185513703364362240> ive encountered an error with ${badUsers[k]} \n ${err}`);
            }
        }

        var updated = false;
        let i = 0;
        for (const user in config) {
            // console.log(`UserName: ${user} NewVidID: ${newVidids[i]} oldVidID: ${config[user].last_post}`);

            // if we get a bad api response, do nothing but log data
            if (room_ids[i] == 'error') {
                // log some data
                console.error(`${user} has returned a null aweme_list at ${Date()}`);

                // continue: skips current loop itteration but doesnt break; it
                continue;
            }

            // if room_id is NOT 0, and we DIDNT know they were live before
            if (room_ids[i] !== 0 && config[user].isLive === 0) {

                // log some data
                console.log(`${user} is live! roomid: ${room_ids[i]}`);

                // we send a message saying that User is live
                // and we save the message.id of the message that we sent, to delete later
                bot.channels.get('262283539469434912').send(`<@185513703364362240> ${user} is live!`)
                    .then((msg) => {
                        console.log(`discord messageid: ${msg.id}`);
                        config[user].live_msg = msg.id;
                        config[user].isLive = 1;

                        /* THIS IS A TEMP FIX */
                        fs.writeFileSync('./lib/tools/tiktokers.json', JSON.stringify(config, null, 2));
                        ttpinger.exportTikTokers(bot);
                    });
                // thinging
                updated = true;


                // if isLive == 1. BUT room_id == 0; then the user WAS live, but isnt anymore
            } else if (room_ids[i] == 0 && config[user].isLive == 1) {

                // log some data
                console.log(`${user} is no longer live!`);

                // delete the previous message saying the user was live
                bot.channels.get('262283539469434912').fetchMessage(config[user].live_msg)
                    .then(msg => {
                        bot.channels.get('262283539469434912').send(`<@185513703364362240> ${user} is no longer live! I should have deleted the other message`);
                        msg.delete();
                    });
                // set the user to NOT be live, and delete the live_msg parameter
                config[user].isLive = 0;
                delete config[user].live_msg;

                // we set updated to true because we have new data that must be written to disk
                /* THIS IS A TEMP FIX */
                fs.writeFileSync('./lib/tools/tiktokers.json', JSON.stringify(config, null, 2));
                ttpinger.exportTikTokers(bot);
                // updated = true;

            }
            i++;
        }
        if (false) {
            console.log('Something was updated!');
            ttpinger.exportTikTokers(bot);
        }
    });
}

module.exports = {
    checkIfLive
}