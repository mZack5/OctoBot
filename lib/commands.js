'use strict';


module.exports.run = async (message, args, command, bot) => {
  // Create an empty array so we can add
  // the names of the commands into it
  let cmdArr = [];

  // We make an empty array for the Descriptions
  // of commands, which hold the same index number
  // as the command they represent
  let desArr = []

  // using the map method, onto an object
  // (arrary?) we can add each array KEY pair
  // into the cmdArr array. we use .help.name to
  // only get the CALLABLE name added to the cmdArr
  bot.commands.map((enumeratedFile) => {
    // push adds an element onto the end of an array
    cmdArr.push(enumeratedFile.help.name.toString());

    // if the command has a help description, we add it to the 
    // desArr in the same index number as the command it represents
    if (enumeratedFile.help.help !== undefined) {
      desArr.push(enumeratedFile.help.help);
    } else {
      // This is important!
      // If the command doesn't have a help description,
      // we append an empty string to the array, which creates
      // and element and index number, although empty, this
      // is so we can preserve the index numbers being the 
      // same as the command it is ment for
      desArr.push('');
    }
  });

  // This For Loop makes the first letter of 
  // every command callable Capitalized for aesthetics
  // and appends a ': ' to the end of every command with
  // a description, for formatting
  // ex: if has description, 'CommandName: Description Here'
  for (let i = 0; i < cmdArr.length; i++) {
    // This Capitalizes the first letter of every element in array
    cmdArr[i] = cmdArr[i].charAt(0).toUpperCase() + cmdArr[i].slice(1);

    // we only add a : to the end of the 
    // command name if it has a description
    if (desArr[i] !== '') {
      cmdArr[i] += ': ';
    }
  }
  // make a var which will be the body of the embed
  // in this var, we join each element in the array
  // using a newline (\r) so in the embed
  // everything is on its own line

  // This is a For Loop where we add together the CommandName
  // and the command Description, then we add a \n newline
  // to the end of every element in the arr for looks
  for (let i = 0; i < cmdArr.length; i++) {
    // we only wanna do this if theres a description for it.
    cmdArr[i] += desArr[i];
    cmdArr[i] += '\n';
  }
  let description = cmdArr.join('');
  // we use embeds to send a nice looking message
  message.channel.send({
    'embed': {
      'title': 'My Current Callable Commands Are:',
      'description': description,
      'color': 1325771
    }
  });
}
module.exports.help = {
  name: 'commands',
  help: 'to list all commands'
}