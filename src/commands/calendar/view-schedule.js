const commando = require('discord.js-commando');

const argTag = 'event-tag';

module.exports = class ViewSchedule extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'view-schedule',
            'aliases': [
                'view',
                'schedule',
                'sched',
                'vs'
            ],
            'group': 'calendar',
            'memberName': 'view-schedule',
            'description': 'View all upcoming & active events',
            'example': [
                'view event',
                'sched mp',
            ],
            'guildOnly': true,
            'throttling': {
                'usages': 1,
                'duration': 15
            },
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

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        
        var oldMessage = EventCalendar.getLatestMessage(msg.channel);

        try {
            if (oldMessage != null)
                await oldMessage.delete();
        } catch(e) {
            console.log('Cannot delete old message: ' + e);
        }
        
        var newMessage = await msg.channel.send(await EventCalendar.listActiveEvents(
            args[argTag],
            msg.guild.id
        ), {
            code: 'Markdown'
        });
        EventCalendar.setLatestMessage(msg.channel, newMessage);

        return newMessage;
    }
}