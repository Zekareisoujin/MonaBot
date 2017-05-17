const commando = require('discord.js-commando');

module.exports = class DeleteEvent extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'list-tags',
            'aliases': [
                'tags',
                'tag'
            ],
            'group': 'calendar',
            'memberName': 'list-tags',
            'description': 'List all active event tags.',
            'example': [
                'tags'
            ],
        });
    }

    hasPermission(msg) {
        return msg.guild ? true : false;
    }

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.listActiveEventTags(msg.guild.id));
    }
}