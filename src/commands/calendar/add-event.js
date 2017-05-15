const commando = require('discord.js-commando');

const argContent = 'event-content';
const argTag = 'event-tag';
const argStart = 'event-start';
const argEnd = 'event-end';

module.exports = class AddEvent extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'add-event',
            'aliases': [
                'add',
                'a'
            ],
            'group': 'calendar',
            'memberName': 'add-event',
            'description': 'Register an event into the calendar',
            'example': [
                'add event "Exploration 4 release" "2017-05-20 19:00:00 UTC-8"',
                'a mp "Shiva Sicarius" "2017-05-20 19:00:00 UTC-8" "2017-05-27 18:59:59 UTC-8"'
            ],
            'args': [
                {
                    'key': argTag,
                    'label': 'tag',
                    'prompt': 'Specify an event tag.',
                    'type': 'string'
                },
                {
                    'key': argContent,
                    'label': 'content',
                    'prompt': 'Specify the event description.',
                    'type': 'string'
                },
                {
                    'key': argStart,
                    'label': 'start time',
                    'prompt': 'Specify the event start time.',
                    'type': 'string'
                },
                {
                    'key': argEnd,
                    'label': 'end time',
                    'prompt': 'Specify the event end time. (optional)',
                    'type': 'string',
                    'default': ''
                }
            ]
        });
    }

    hasPermission(msg) {
        const EventCalendar = this.client.EventCalendar;
        return EventCalendar.hasModeratorPermission(msg);
    }

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.createEvent(
            args[argContent], 
            args[argTag],
            msg.guild.id,
            args[argStart],
            args[argEnd]
        ));
    }
}