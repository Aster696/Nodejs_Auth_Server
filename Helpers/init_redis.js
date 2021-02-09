const redis = require('redis');

const Client = redis.createClient({
    port: 6379,
    hsot: "127.0.0.1"
});

Client.on('connect', () => {
    console.log("Client connected to redis");
});

Client.on('ready', () => {
    console.log("Redis ready to use... ");
});

Client.on('error', (error) => {
    console.log(error.message);
});

Client.on('end', () => {
    console.log('Client connection endded');
});

process.on('SIGINT', () => {
    Client.quit();
});

module.exports = Client;