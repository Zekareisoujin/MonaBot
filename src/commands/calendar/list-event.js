const commando = require('discord.js-commando');

const argTag = 'event-tag';

module.exports = class ListEvent extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'list-event',
            'aliases': [
                'list',
                'ls'
            ],
            'group': 'calendar',
            'memberName': 'list-event',
            'description': 'List the details of all upcoming & active events',
            'example': [
                'list event',
                'ls mp'
            ],
            'guildOnly': true,
            'args': [
                {
                    'key': argTag,
                    'label': 'tag',
                    'prompt': 'Specify an event tag.',
                    'type': 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        const EventCalendar = this.client.EventCalendar;
        return EventCalendar.hasModeratorPermission(msg.guild, msg.member);
    }

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.listActiveEventsWithID(
            args[argTag],
            msg.guild.id
        ), {
            code: 'Markdown'
        });
    }
}