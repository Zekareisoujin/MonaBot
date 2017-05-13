/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// Import the discord.js module
const Discord = require('discord.js-commando');

// Create an instance of a Discord client
const client = new Discord.Client();

let auth
try {
  auth = require('./auth.json')
} catch (err) {
  auth = {
    token: process.env['TOKEN'],
    admins: (process.env['ADMINS'] || '').split(',')
  }
}

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
        console.log(message.author);
    }
});

client.login(auth.token);