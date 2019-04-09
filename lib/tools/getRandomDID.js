async function getRandomDID() {
    return new Promise((resolve) => {
        // the first number can't be 0
        let betterID = (Math.floor(Math.random() * 9) + 1).toString();
        // id length must be between 19 and 15 numbers
        const len = (Math.floor(Math.random() * 4) + 15);

        for (let i = 0; i < len; i++) {
            // append a random number to the end of betterID
            betterID += Math.floor(Math.random() * 10);
        }
        resolve(betterID);
    });
}

module.exports = {
    getRandomDID
}