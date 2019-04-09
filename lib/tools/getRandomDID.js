async function getRandomDID() {
    // the first number can't be 0
    let device_id = (Math.floor(Math.random() * 9) + 1).toString();
    // id length must be between 19 and 15 numbers
    const len = (Math.floor(Math.random() * 4) + 15);

    for (let i = 0; i < len; i++) {
        // append a random number to the end of device_id
        device_id += Math.floor(Math.random() * 10);
    }
    return device_id;
}

module.exports = {
    getRandomDID
}