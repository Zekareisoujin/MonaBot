const commando = require('discord.js-commando');

const argId = 'event-id';

module.exports = class DeleteEvent extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'delete-event',
            'aliases': [
                'delete',
                'del'
            ],
            'group': 'calendar',
            'memberName': 'delete-event',
            'description': 'Delete the specified event ID.',
            'example': [
                'delete 1',
                'del 2'
            ],
            'args': [
                {
                    'key': argId,
                    'label': 'event ID',
                    'prompt': 'Specify an event ID.',
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
        return msg.channel.send(await EventCalendar.deleteEvent(args[argId]));
    }
}