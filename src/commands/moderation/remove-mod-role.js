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
            'guildOnly': true,
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
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }

    async run(msg, args) {
        const EventCalendar = this.client.EventCalendar;
        return msg.channel.send(await EventCalendar.removeModerator(
            msg.guild.id,
            args[argRole].id
        ));
    }
}