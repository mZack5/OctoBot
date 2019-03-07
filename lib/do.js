"use strict";
/*
let digitalocean = require('digitalocean');
let client = digitalocean.client(process.env.digitaltoken);

module.exports.run = async (message, args, command, bot) => {

  /**
   * 
   *  inputs: (!do: ) list | create | destroy | turnoff 
   *  | backup | mcfulldestory | mcfullrebuild |  
   * 
   * 
   */
/*
  if (args.length > 0) {
    switch (args[0].toLowerCase()) {
      case "list":
        client.droplets.list()
          .then(function (droplets) {
            console.log(droplets[0]);
            let droplet = droplets[0];
            message.channel.send(droplet);
          }).catch(function (err) {
            console.log(`
            
            /********************************************** \n
            /********************************************** \n
            /********************************************** \n
            ERROR! \n
            ${err}
            `);
          });

        break;
      case "case2":

        break;

      case "case3":

        break;

      case "case4":

        break;
    }
  } else {
  }





}
 */

module.exports.help = {
  name: 'do',
  help: 'yeah this doesnt work anymore'
}