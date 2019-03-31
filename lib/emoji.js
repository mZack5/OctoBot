"use strict";
const fs = require('fs');
module.exports.run = async (message, args, command, bot) => {

    if (args[0] == undefined) return message.channel.send('Expected inputs are [add] (url) or [delete] (name) or [update] (old name) (new name)');
    switch (args[0].toLowerCase()) {
        case "add":
            // we should probably do some checking for if the url is valid
            //console.log(message.guild);
            if (args[2] == undefined) return message.channel.send('Error! Emoji name should be after the url!');

            message.guild.createEmoji(args[1], args[2], null, 'if ur reading this, ur mom gay')
                .then((created) => {
                    message.channel.send(`Emoji created! With name: ${args[2]}`)
                })
                .catch((error) => {
                    message.channel.send(`${error}`)
                });
            break;

        case "delete":
            if (args[1] == undefined) return message.channel.send('Error! Which emoji should I delete?');

            let emojiToDelete = message.guild.emojis.find(emoji => emoji.name === args[1]);
            if (emojiToDelete) {
                message.guild.deleteEmoji(emojiToDelete)
                    .then(message.channel.send('Emoji deleted!'))
                    .catch((error) => {
                        message.channel.send(error)
                    });
            } else return message.channel.send(`Error! I couldn't find that emoji, please type out the name of the emoji\nI can't delete emoji literals yet (. _  .)`);
            break;

        case "rename":
            return message.channel.send('this doesnt fucking work');
            if (args[1] == undefined) return message.channel.send('Error! Which emoji should I rename?');
            if (args[2] == undefined) return message.channel.send('Error! What should I rename the emoji to?');

            let emojiToRename = message.guild.emojis.find(emoji => emoji.name === args[1]);
            if (emojiToRename) {
                emojiToRename.setName(args[2])
                    .then(message.channel.send(`Emoji edited!`))
                    .catch((error) => {
                        message.channel.send(`error renaming emoji \n${error}`)
                    });
            } else return message.channel.send(`Error! I couldn't find that emoji, please type out the name of the emoji\nI can't delete emoji literals yet (. _  .)`);
            break;

        default:
            break;
    }

}

module.exports.help = {
    name: 'emoji',
    help: '[add] (url) (name) or [delete] (name) or [rename] (name)'
}