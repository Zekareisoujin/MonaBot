const commando = require('discord.js-commando');

const argContent = 'content';

module.exports = class SayCommand extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'say',
            'group': 'misc',
            'memberName': 'say',
            'description': 'Make Mona say something.',
            'example': [
                'say you suck'
            ],
            'guildOnly': true,
            'args': [
                {
                    'key': argContent,
                    'label': 'content',
                    'prompt': 'Specify what Mona should say.',
                    'type': 'string',
                }
            ]
        });
    }

    hasPermission(msg) {
        const EventCalendar = this.client.EventCalendar;
        return EventCalendar.hasModeratorPermission(msg.guild, msg.member) || this.client.isOwner(msg.author);
    }

    async run(msg, args) {
        msg.delete()
            .then(() => {
                return msg.channel.send(args[argContent]);
            })
            .catch((err) => {
                // do nothing, pretends that the bot does not know that it doesn't have the permission
            });
    }
}