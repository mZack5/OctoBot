"use strict";


module.exports.run = async (message, args, command, bot) => {
  // Create an empty array so we can add
  // the names of the commands into it
  let arr = [];

  // using the map method, onto an object
  // (arrary?) we can add each array KEY pair
  // into the arr array. we use .help.name to
  // only get the CALLABLE name added to the arr
  bot.commands.map((enumeratedFile) => {
    // push adds an element onto the end of an array
    arr.push(enumeratedFile.help.name.toString());
  });

  // we print the finished arrary
  console.log("before fancy "+arr);

for (let i = 0; i < arr.length; i++) {
  console.log("arr before is "+arr);
  arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  console.log("arr after is "+arr);
}


  // make a var which will be the body of the embed
  // in this var, we join each element in the array
  // using a newline (\r) so in the embed
  // everything is on its own line
  let description = arr.join("\n");

  // we use embeds to send a nice looking message
  message.channel.send({
    "embed": {
      "title": "My Current Callable Commands Are:",
      "description": description,
      "color": 1325771
    }
  });
}
module.exports.help = {
  name: 'commands'
}


/**
 * 
 * {
  "embed": {
    "title": "My Commands",
    "description": "do \r mc \r avatar",
    "color": 1325771
  }
}
 */