const commando = require('discord.js-commando');
const MessageEmbed = require('discord.js').MessageEmbed;

const argMsgId = 'content';

module.exports = class SayCommand extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'quote',
            'aliases': [
                'q'
            ],
            'group': 'misc',
            'memberName': 'quote',
            'description': 'Quote some message.',
            'example': [
                'quote 123456789'
            ],
            'guildOnly': true,
            'args': [
                {
                    'key': argMsgId,
                    'label': 'messageId',
                    'prompt': 'Specify message ID that Mona should quote.',
                    'type': 'string',
                }
            ]
        });
    }

    hasPermission(msg) {
        return true;
    }

    async run(msg, args) {
        msg.delete()
            .then(() => {
                const messageId = args[argMsgId];
                return msg.channel.messages.fetch(messageId).catch(() => {
                    return null;
                });
            })
            .then((message) => {
                if (message == null) {
                    return msg.channel.send("Invalid message ID");
                }
                const author = message.author.username + '#' + message.author.discriminator;
                const channel = '#' + message.channel.name;
                const embed = new MessageEmbed()
                    .setAuthor(author + ' in ' + channel, message.author.avatarURL())
                    .setDescription(message.content)
                    .setTimestamp(new Date(message.createdTimestamp));
                return msg.channel.send({embed});
            })
            .catch((err) => {
                console.error(err);
                // do nothing, pretends that the bot does not know that it doesn't have the permission
            });
    }
}