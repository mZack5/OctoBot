'use strict';
const request = require('request-promise-native');
const id = require('./getRandomDID');

async function getUserName(user_id) {
    const device_id = await id.getRandomDID();
    const url = `https://api2.musical.ly/aweme/v1/user/?user_id=${user_id}&retry_type=no_retry&mcc_mnc=311480&app_language=en&language=en&region=US&sys_region=US&carrier_region=US&carrier_region_v2=&build_number=10.7.1&timezone_offset=-18000&timezone_name=America%2FNew_York&is_my_cn=0&fp=FlTrLrTZcMPZFl5MLrU1LSFeFSKe&account_region=US&pass-region=1&pass-route=1&device_id=${device_id}&ac=wifi&channel=googleplay&aid=1233&app_name=trill&version_code=513&version_name=5.1.3&device_platform=android&ab_version=10.7.1&ssmix=a&device_type=Pixel+2+XL&device_brand=google&os_api=28&os_version=9&openudid=a2a1b01532e4dca8&manifest_version_code=2019040234&resolution=1440*2737&dpi=476&update_version_code=2019040234&_rticket=1554982589726&ts=1554982589&as=a1iosdfgh&cp=androide1`
    return new Promise((resolve, reject) => {
        request({
            uri: url,
            headers: {
                'User-Agent': 'com.zhiliaoapp.musically/2019031132 (Linux; U; Android 9; en_US; Pixel 2 XL; Build/PQ2A.190305.002; Cronet/58.0.2991.0)'
            },
            json: true
        }).then((data) => {
            if (data.user.unique_id === "") {
                reject('Invaild user_id!');
            } else {
                resolve(data.user.unique_id);
            }
        }).catch((err) => {
            reject(`(GetUserName): Failed to get username: \n${err}`);
        });
    });
}

module.exports = {
    getUserName
}