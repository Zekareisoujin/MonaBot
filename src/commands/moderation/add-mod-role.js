const commando = require('discord.js-commando');

const argRole = 'role';

module.exports = class AddModeratorRole extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'add-mod-role',
            'aliases': [
                'addmod',
            ],
            'group': 'moderation',
            'memberName': 'add-mod-role',
            'description': 'Enable moderator right for the specified role.',
            'example': [
                'addmod @Helper',
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
        return msg.channel.send(await EventCalendar.addModerator(
            msg.guild.id,
            args[argRole].id
        ));
    }
}