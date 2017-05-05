/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// File reader to read app token
const fs = require('fs');

// // The token of your bot - https://discordapp.com/developers/applications/me
// const token = '';

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
    // If the message is "ping"
    if (message.content === 'ping') {
        // Send "pong" to the same channel
        message.channel.send('pong');
    }
});

fs.readFile('token', (err, data) => {
    if (err) throw err;
    var token = (new String(data)).toString();

    // Log our bot in
    client.login(token);
});