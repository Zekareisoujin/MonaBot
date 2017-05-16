const commando = require('discord.js-commando');

module.exports = class RemoveModeratorRole extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'list-mod-role',
            'aliases': [
                'lsmod'
            ],
            'group': 'moderation',
            'memberName': 'list-mod-role',
            'description': 'List all server roles that have moderator rights.',
            'example': [
                'lsmod'
            ],
        });
    }
    
    hasPermission(msg) {
        if (!msg.guild)
            return this.client.isOwner(msg.author);
        return msg.member.hasPermission('ADMINISTRATOR');
    }

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.listModerators(msg.guild));
    }
}