const commando = require('discord.js-commando');

const argRole = 'role';

module.exports = class RemoveModeratorRole extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'remove-mod-role',
            'aliases': [
                'remmod',
                'rmmod'
            ],
            'group': 'moderation',
            'memberName': 'remove-mod-role',
            'description': 'Remove moderator right for the specified role.',
            'example': [
                'remmod @Helper',
                'rmmod Helper'
            ],
            'args': [
                {
                    'key': argRole,
                    'label': 'role',
                    'prompt': 'Specify a role.',
                    'type': 'role'
                }
            ]
        });
    }
    
    hasPermission(msg) {
        if (!msg.guild)
            // return this.client.isOwner(msg.author);
            return false;
        return msg.member.hasPermission('ADMINISTRATOR');
    }

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.removeModerator(
            msg.guild.id,
            args[argRole].id
        ));
    }
}