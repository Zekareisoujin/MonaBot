const commando = require('discord.js-commando');
const RichEmbed = require('discord.js').RichEmbed;

const argKey = 'user';

module.exports = class UserInfoCommand extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'user-info',
            'aliases': [
                'user',
                'u'
            ],
            'group': 'moderation',
            'memberName': 'user-info',
            'description': 'Display user info.',
            'example': [
                'user Nad#4039',
                'u Nad'
            ],
            'args': [
                {
                    'key': argKey,
                    'label': 'user',
                    'prompt': 'Specify an user.',
                    'type': 'member',
                }
            ]
        });
    }

    hasPermission(msg) {
        if (!msg.guild)
            return this.client.isOwner(msg.author);
        return msg.member.hasPermission('ADMINISTRATOR');
    }

    async run(msg, args) {
        const member = args[argKey];
        const user = member.user;
        const embed = new RichEmbed()
            .setAuthor(user.username)
            .setThumbnail(user.avatarURL)
            .addField('ID', user.id)
            .addField('Nickname', member.nickname ? member.nickname : 'None')
            .addField('Register date', user.createdAt)
            .addField('Join date', member.joinedAt);
        
        return msg.channel.send({embed});
    }
}