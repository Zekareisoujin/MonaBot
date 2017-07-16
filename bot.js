const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const Sequelize = require('sequelize');
const EventCalendar = require('./src/calendar/EventCalendar.js');
const PartyFinder = require('./src/party-finder/PartyFinder.js');

let config
try {
    config = require('./config.json')
} catch (err) {
    config = {
        db: process.env['DATABASE_URL'],
        auth: {
            token: process.env['TOKEN'],
            admins: (process.env['ADMINS'] || '').split(',')
        }
    }
}

const client = new commando.Client({
    'owner': config.auth.admins,
    'commandPrefix': '$',
    'unknownCommandResponse': false
})

client
    .on('error', console.error)
    .on('warn', console.warn)
    .on('debug', console.log)
    .on('ready', () => {
        console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
        client.user.setGame('You must be tired after today | Let’s go to sleep.')
    })
    .on('disconnect', () => { console.warn('Disconnected!'); })
    .on('reconnecting', () => { console.warn('Reconnecting...'); })
    .on('commandError', (cmd, err) => {
        if (err instanceof commando.FriendlyError) return;
        console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    })
    .on('commandBlocked', (msg, reason) => {
        console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
    })
    .on('commandPrefixChange', (guild, prefix) => {
        console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('commandStatusChange', (guild, command, enabled) => {
        console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('groupStatusChange', (guild, group, enabled) => {
        console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    });

// client.setProvider(
//     sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new commando.SQLiteProvider(db))
// ).catch(console.error);

// Monkey patching
const CommandMessage = require('discord.js-commando/src/commands/message.js');
client.dispatcher.parseMessage = function(message) {
    for(const commandList of this.registry.commands) {
        const command = commandList[1];
        if(!command.patterns) continue;
        for(const pattern of command.patterns) {
            const matches = pattern.exec(message.content);
            if(matches) return new CommandMessage(message, command, null, matches);
        }
    }

    // Find the command to run with default command handling
    const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix;
    if(!this._commandPatterns[prefix]) this.buildCommandPattern(prefix);
    let cmdMsg = this.matchDefault(message, this._commandPatterns[prefix], 2);
    if(!cmdMsg && !message.guild && !this.client.options.selfbot) cmdMsg = this.matchDefault(message, /^([^\s]+)/i);
    return cmdMsg;
}.bind(client.dispatcher);


var sequelizeClient = new Sequelize(config.db);
sequelizeClient.authenticate()
    .then(() => {
        var eventCalendar = new EventCalendar(sequelizeClient);
        client.EventCalendar = eventCalendar;
        var partyFinder = new PartyFinder(sequelizeClient);
        client.PartyFinder = partyFinder;
    })
    .catch((err) => {
        console.error('Unable to initialize event calendar', err);
        throw err;
    });


client.registry
    .registerGroup('moderation', 'Moderation')
    .registerGroup('calendar', 'Calendar')
    .registerGroup('party-finder', 'Party Finder')
    .registerGroup('misc', 'Miscellaneous')
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'src/commands'));

client.login(config.auth.token);