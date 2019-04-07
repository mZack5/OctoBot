'use strict';

module.exports.run = async (message, args, command, bot) => {

    // if the user who ran the account cannot delete messages we do nothing
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return;
    // if the bot cannot delete messages, we do a warning
    if (!message.guild.member(bot.user).hasPermission('MANAGE_MESSAGES')) return message.channel.send(`I can't delete messages...`)
        .then((msg) => {
            msg.delete(3000);
        });

    // if we're here, all permissions are correct
    // if the user left the first input blank, we do a warning

    if (args[0] == undefined) return message.channel.send(`How much should I prune?`)
        .then((msg) => {
            msg.delete(3000);
        });

    if (args[0] >= 2 && args[0] <= 100) {
        /** 
         * 
         * fuck jordan
         * 
         * 
         * 
         * 
         */
        message.channel.bulkDelete(args[0]).then((deletedMessages) => {
            message.channel.send(`Pruned ${args[0]} messages!`)
                .then(msg => {
                    msg.delete(3000);
                });
        });
    }
    // else if (message.mentions.users.first().id) {
    //     if (args[1] >= 2 && args[1] <= 100) {
    //         message.channel.fetchMessages()
    //             .then((messages) => {
    //                 let toDelete= messages.filter(m => m.author.id === message.mentions.users.first().id);
    //                 for (const msgs in toDelete) {
    //                     toDelete[msgs].delete();
    //                 }
    //             })
    //     } else {
    //         return message.channel.send('How many messages should I prune?')
    //     }

}
module.exports.help = {
    name: 'prune',
    help: '[2 - 100] or [@user] (2 - 100) or [user_id] (2 - 100)'
}