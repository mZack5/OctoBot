const request = require("request");
const config = require("./config.json");

var octo_token = config.octo_token;

exports.returnJSON = function (url, path, callback) {
  url = url + path;
  request.get({
    url: url,
    json: true,
    headers: { "X-Api-Key": octo_token }
  }, function (err, res, data) {
    if (err) {
      //console.log("Error");
    } else if (res.statusCode !== 200) {
      //console.log('Status');
    } else {
     // console.log("No Error");
      callback(data);
    }
  });
}