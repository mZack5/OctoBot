'use strict';
const fs = require('fs');

function importConfig(bot) {
    return new Promise((resolve, reject) => {
        bot.channels.get('554477335395696649').fetchMessage('561660996960387103')
            .then(msg => {
                console.log(`Loaded config from discord message => disk`);
                fs.writeFileSync('./config.json', JSON.stringify(JSON.parse(msg)));
                resolve();
            }).catch((error) => {
            return console.error(`Error importing config: \n ${error}`)
            });
    })
}

function exportConfig(bot) {
    let config = JSON.parse(fs.readFileSync('./config.json'));
    bot.channels.get('554477335395696649').fetchMessage('561660996960387103')
        .then(msg => {
            msg.edit(JSON.stringify(config, null, 2));
            return true;
        });
}

module.exports = {
    exportConfig,
    importConfig
}