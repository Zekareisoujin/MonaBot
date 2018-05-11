const commando = require('discord.js-commando');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const Sequelize = require('sequelize');
const EventCalendar = require('./src/calendar/EventCalendar.js');
const PartyFinder = require('./src/party-finder/PartyFinder.js');
const SeedCalendar = require('./src/calendar/SeedCalendar.js');

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
        client.user.setActivity({
            name: 'You must be tired after today | Let’s go to sleep.'
        });
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
    })
    .on('unhandledRejection', err => {
        console.error('Uncaught Promise Rejection: \n${err.stack}');
    });

// client.setProvider(
//     sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new commando.SQLiteProvider(db))
// ).catch(console.error);

var sequelizeClient = new Sequelize(config.db);
sequelizeClient.authenticate()
    .then(() => {
        var eventCalendar = new EventCalendar(sequelizeClient);
        client.EventCalendar = eventCalendar;
        var partyFinder = new PartyFinder(sequelizeClient);
        client.PartyFinder = partyFinder;
        client.SeedCalendar = new SeedCalendar();
    })
    .catch((err) => {
        console.error('Unable to initialize event calendar', err);
        throw err;
    });

// Separate message handler
client
    .on('message', function (message) {
        this.PartyFinder.monitorPartyChannel(message);
    }.bind(client));

client.registry
    .registerGroup('moderation', 'Moderation')
    .registerGroup('calendar', 'Calendar')
    .registerGroup('party-finder', 'Party Finder')
    .registerGroup('mobius', 'Mobius')
    .registerGroup('misc', 'Miscellaneous')
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'src/commands'));

client.login(config.auth.token);