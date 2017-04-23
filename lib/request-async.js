 "use strict";
const request = require("request");
const config = require("./config.json");

let octo_token = config.octo_token;
let base_url = config.base_url;

exports.requestAsyncURL = function (path) {
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