'use strict';
const request = require('request-promise-native');
const id = require('./getRandomDID');

async function getUserName(user_id) {
    const device_id = await id.getRandomDID();
    const url = `https://api2.musical.ly/aweme/v1/user/?user_id=${user_id}&version_code=7.0.0&language=en&app_name=musical_ly&app_version=7.0.0&is_my_cn=0&channel=App%20Store&mcc_mnc=&tz_offset=US&account_region=&sys_region=-28800&aid=1233&screen_width=750&os_api=18&ac=mobile&os_version=11.4&app_language=en&tz_name=US&device_platform=iphone&build_number=76001&device_type=iPhone9,1&volume=0.25&ts=Pacific%20Standard%20Time&device_id=${device_id}`;

    return new Promise((resolve, reject) => {
        request({
            uri: url,
            headers: {
                'User-Agent': 'com.zhiliaoapp.musically/2019031132 (Linux; U; Android 9; en_US; Pixel 2 XL; Build/PQ2A.190305.002; Cronet/58.0.2991.0)'
            },
            json: true
        }).then((data) => {
            resolve(data.user.unique_id);
        }).catch((err) => {
            reject(`(GetUserName): Failed to get username: \n${err}`);
        });
    });
}

module.exports = {
    getUserName
}
/**
 * this is a self made URL using MITMProxy, but it doesnt work. 
 * the URL I am actually using i got from someone else
 * im keeping this old URL here for no real reason
 * https://api2.musical.ly/aweme/v1/user/?user_id=${user_id}&retry_type=no_retry&mcc_mnc=311480&app_language=en&language=en&region=US&sys_region=US&carrier_region=US&carrier_region_v2=&build_number=10.4.0&timezone_offset=-18000&timezone_name=America%2FNew_York&is_my_cn=0&fp=&account_region=US&pass-region=1&pass-route=1&iid=6667239581710714630&device_id=6617585804464326150&ac=wifi&channel=googleplay&aid=1233&app_name=musical_ly&version_code=100400&version_name=10.4.0&device_platform=android&ab_version=10.4.0&ssmix=a&device_type=Pixel+2+XL&device_brand=google&os_api=28&os_version=9&openudid=a2a1b01532e4dca8&manifest_version_code=2019031132&resolution=1440*2737&dpi=476&update_version_code=2019031132&_rticket=1552546556266&ts=1552546556&as=a1b5af980ccfec5ae92200&cp=f1ffc553cf9f82a8e1awOa&mas=012f4eb79e0f305ebe95af977e0609eae30c0c4c4c9ca686acc6a6
 */