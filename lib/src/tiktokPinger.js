"use strict";

const request = require('request');
const fs = require('fs');

/**
 * So i want this to be a file that checks tiktokapi.ga
 * every 10 minutes or so, and checks if theres new tiktoks
 * compared to the last time it checked
 * if so: it should ping me in my test discord server
 * if not: then do nothing
 * 
 * 
 * 
 * 
 */

exports.checkIfNewVideos = (bot) => {
    request('http://tiktokapi.ga/php/jsonusrinfo.php?uid=137694298950545408', (error, response, body) => {
        if (!error && response.statusCode == 200) {

            let config = JSON.parse(fs.readFileSync('./config.json'));

            let body_good = JSON.parse(body);
            console.log(body_good.user.dongtai_count);

            let newvidcount = body_good.user.dongtai_count;
            //current_videos = config.videos;

            if (newvidcount > config.videos) {
                // we're here if we have new videos
                //message channel @Zach new videos

                for (let i = 0; i < 5; i++) {
                    bot.channels.get('262283539469434912').send('<@185513703364362240> Black_Hayate uploaded new videos!');
                }

                config.videos = newvidcount;
                fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
                console.log('we have new videos!');
            } else {
                // we're here if we dont have any new videos
                console.log('we have no new videos');
            }


            //fs.writeFileSync('./web.json', JSON.stringify(test, null, 2));
        }
    });
}