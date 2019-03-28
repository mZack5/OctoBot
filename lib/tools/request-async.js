 "use strict";


 /*
 *
 * Module to Take an address (From OctoPrint Only*) and return JSON data from it
 * asynchronous, ment to be used in Promises.
 *  *can only be used for octoprint as it forces the Octoprint api key
 *   header in every GET request.
 * 
 *
const request = require("request");
const config = require("./config.json");
const tokens = require("./tokens.json");

let octo_token = tokens.octo_token;
let base_url = config.base_url;

exports.requestAsyncURL = (path) => {
 let url = base_url + path;
  return new Promise(function (resolve, reject) {
    request.get({
      url: url,
      headers: { "X-Api-Key": octo_token }
    }, function (err, res, body) {
      return resolve([body]);
    });
  });
}

*/