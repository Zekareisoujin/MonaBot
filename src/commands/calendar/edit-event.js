const commando = require('discord.js-commando');

const argId = 'event-id';
const argField = 'event-field';
const argValue = 'event-value';

const allowedProperty = ['content', 'tag', 'start_time', 'end_time'];

module.exports = class EditEvent extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'edit-event',
            'aliases': [
                'edit',
                'e'
            ],
            'group': 'calendar',
            'memberName': 'edit-event',
            'description': 'Edit an existing event in the calendar',
            'example': [
                'edit 2 content "Exploration 4 release"',
                'e 4 start_time "2017-05-20 19:00:00 UTC-8"'
            ],
            'guildOnly': true,
            'args': [
                {
                    'key': argId,
                    'label': 'event ID',
                    'prompt': 'Specify an event ID.',
                    'type': 'string'
                },
                {
                    'key': argField,
                    'label': 'event property',
                    'prompt': ['Specify the event property. Valid values are: ', 
                            allowedProperty.join(', ')
                        ].join(''),
                    'type': 'string'
                },
                {
                    'key': argValue,
                    'label': 'property value',
                    'prompt': 'Specify the property value.',
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
        if (allowedProperty.indexOf(args[argField]) < 0)
            return msg.channel.send("Invalid property specified.");

        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.updateEvent(
            args[argId],
            args[argField],
            args[argValue],
            msg.guild.id
        ));
    }
}