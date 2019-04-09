'use strict';

const fs = require('fs');

module.exports.run = async (message, args, command, bot) => {
  /*
    if (args.length == 0) return message.channel.send('Arguments can\'t be blank\!')
      .then(msg => msg.delete(2000))
      .then(message.delete(2000));

    switch (args[0].toLowerCase()) {

      case 'whosonline':
        // if we're here, the command should look like
        // -mc ping IPADDR ?PORT
        console.log('args0 ' + args[0])
        console.log('args1 ' + args[1])
        if (args[1] == undefined) {
          return message.channel.send('Expected IP or Domain as 3rd Argument\!')
            .then(msg => msg.delete(5000))
            .then(message.delete(2000));
        }
        // If we're here, we have been supplied an IP
        let ipAddr = args[1];

        // one bigass function call
        mcping(ipAddr, 25565, function (err, res) {
          if (err) {
            //message.channel.send(`WARN: RETURNED ERROR \n ${err}`);
            message.channel.send({
              embed: {
                color: 3447003,
                description: 'Warning, ERR received!\n' + err
              }
            });
          } else {
            // We're here if we have pinged the server successfully 
            // and have gotten a vaild responce
            let serverInfo = JSON.stringify(res, null, 2);
            fs.writeFileSync('./test1.txt', serverInfo);
            console.log(JSON.stringify(res.players.online));

            if (JSON.stringify(res.players.online) == 0) {
              message.channel.send({
                embed: {
                  color: 3447003,
                  description: 'There\'s Currently no one online :disappointed_relieved:!'
                }
              });
            }
            if (JSON.stringify(res.players.online) == 1) {
              message.channel.send({
                embed: {
                  color: 3447003,
                  description: 'Only sad little  '
                }
              });
            }
          }
        }, 3000);
    }
    */
}
module.exports.help = {
  name: 'mc',
  help: 'This command is ment to get stats about a given minecraft server'
}