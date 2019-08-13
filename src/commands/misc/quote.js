const commando = require('discord.js-commando');
const RichEmbed = require('discord.js').RichEmbed;

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
        const quoteInput = args[argMsgId].split('-');
        var retPromise;
        if (quoteInput.length == 1) {
            retPromise = msg.channel.fetchMessage(quoteInput[0]);
        }else {
            var channel = msg.guild.channels.get(quoteInput[0]);
            if (channel == undefined) {
                channel = {
                    fetchMessage: function() {
                        return Promise.reject();
                    }
                }
            }
            retPromise = channel.fetchMessage(quoteInput[1]);
        }
        //return msg.channel.fetchMessage(messageId)
        return retPromise
            .then(message => {
                const author = message.author.username + '#' + message.author.discriminator;
                const channel = '#' + message.channel.name;
                const attachment = message.attachments.first();
                console.log(message.attachments);
                console.log(attachment);
                const embed = new RichEmbed()
                    .setAuthor(author + ' in ' + channel, message.author.displayAvatarURL)
                    .setDescription(message.content)
                    .setTimestamp(new Date(message.createdTimestamp))
                    .setImage(attachment ? attachment.url : '')
                    .setURL(message.url);
                
                msg.delete(10000)
                return msg.channel.send({embed});
            })
            .catch(() => {
                const reply = msg.channel.send("Invalid message ID")
                reply.then(rep => rep.delete(5000))
                return reply;
            })
    }
}