const commando = require('discord.js-commando');
const MessageEmbed = require('discord.js').MessageEmbed;

const subCmdEnum = {
    START: 'start',
    STOP: 'stop'
}
const argSubcmd = 'sub-command';

module.exports = class PFView extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'pf-view',
            'aliases': [
                'pf'
            ],
            'group': 'party-finder',
            'memberName': 'pf-view',
            'description': 'View PF for current channel',
            'example': [
                'pf',
                'pf stop'
            ],
            'guildOnly': true,
            'args': [
                {
                    'key': argSubcmd,
                    'label': 'sub-command',
                    'prompt': ['Specify an sub command. Valid values are: ',
                        Object.values(subCmdEnum).join(', ')
                    ].join(''),
                    'type': 'string',
                    'default': subCmdEnum.START
                }
            ]
        });
    }

    async run(msg, args) {
        const PartyFinder = this.client.PartyFinder;
        if (PartyFinder.pfUpdater == undefined)
            PartyFinder.pfUpdater = {};

        if (PartyFinder.isMonitored(msg.channel)) {
            if (args[argSubcmd] == subCmdEnum.START) {
                if (PartyFinder.pfUpdater[msg.channel.id] == undefined) {
                    var interval = PartyFinder.getChannelRefreshRate(msg.channel);
                    var thisUpdater = PartyFinder.pfUpdater[msg.channel.id] = {
                        PartyFinder: PartyFinder,
                        channel: msg.channel,
                        update: this.updatePFMessage,
                        replace: this.replacePFMessage,
                        query: this.queryPFInfo
                    };
                    thisUpdater.timeOut = setInterval(this.runPFUpdater.bind(thisUpdater), interval * 1000);
                    thisUpdater.replace();
                }

            } else if (args[argSubcmd] == subCmdEnum.STOP) {
                clearInterval(PartyFinder.pfUpdater[msg.channel.id].timeOut);
                delete PartyFinder.pfUpdater[msg.channel.id];
            }
        } else {
            return msg.channel.send("This channel is not a Party Finder channel.");
        }
    }

    runPFUpdater() {
        if (this.replaceRequired)
            this.replace();
        else
            this.update();
    }

    async replacePFMessage() {
        var embed = this.query(this.PartyFinder, this.channel);
        if (this.message != undefined) {
            var deletedMsg = await this.message.delete();
        }
        this.message = await this.channel.send({embed});
        this.replaceRequired = false;
    }

    async updatePFMessage() {
        var embed = this.query(this.PartyFinder, this.channel);
        if (this.message != undefined) {
            this.message = await this.message.edit({embed});
        }
    }

    queryPFInfo(PartyFinder, channel) {
        var pflist = PartyFinder.retrievePFUsers(channel);

        const embed = new MessageEmbed()
            .setTitle('Party Finder')
            .setDescription('Type lfg/lfm (with roles) to be registered here.')
            .setColor(13737291)
            .setTimestamp(new Date());

        embed.addFieldFromList = function(title, list) {
            if (list != undefined && list.length > 0) {
                var nameList = list.join('\n');
                this.addField(title, nameList, true);
            }
            return this;
        }

        embed
            .addFieldFromList('Looking For More/Members', pflist[PartyFinder.TYPE_LFM])
            .addFieldFromList('LFG - Attacker', pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.attack.name])
            .addFieldFromList('LFG - Breaker', pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.break.name])
            .addFieldFromList('LFG - Defender', pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.defend.name])
            .addFieldFromList('LFG - Support', pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.support.name])

        return embed;
    }
}
