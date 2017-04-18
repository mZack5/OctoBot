const request = require("request");
const config = require("./config.json");

var octo_token = config.octo_token;
var base_url = config.base_url;

exports.requestAsyncURL = function (path) {
  url = base_url + path;
  return new Promise(function (resolve, reject) {
    request.get({
      url: url,
      headers: { "X-Api-Key": octo_token }
    }, function (err, res, body) {
      return resolve([body]);
    });
  });
}