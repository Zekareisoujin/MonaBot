const commando = require('discord.js-commando');

const subCmdEnum = {
    REGISTER: 'register',
    DEREGISTER: 'deregister',
    ADD: 'add',
    CLEAR: 'clear'
}
const argSubcmd = 'sub-command';
const argExtraParam = 'extra-param';

module.exports = class PFChannelManage extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'pf-manage',
            'aliases': [
                'pfm'
            ],
            'group': 'party-finder',
            'memberName': 'pf-manage',
            'description': 'Manage PF channels',
            'example': [
                'pfm register',
                'pfm deregister',
                'pfm add #mp-1',
                'pfm clear'
            ],
            'guildOnly': true,
            'args': [
                {
                    'key': argSubcmd,
                    'label': 'sub-command',
                    'prompt': ['Specify an sub command. Valid values are: ',
                        Object.values(subCmdEnum).join(', ')
                    ].join(''),
                    'type': 'string'
                },
                {
                    'key': argExtraParam,
                    'label': 'extra-param',
                    'prompt': 'Extra parameter for sub cmd ADD',
                    'type': 'channel',
                    'default': ''
                }
            ]
        });
    }

    hasPermission(msg) {
        const EventCalendar = this.client.EventCalendar;
        return EventCalendar.hasModeratorPermission(msg.guild, msg.member);
    }

    async run(msg, args) {
        var retMsg;
        if (Object.values(subCmdEnum).indexOf(args[argSubcmd]) < 0)
            retMsg = "Invalid subcommand used.";

        const PartyFinder = this.client.PartyFinder;
        if (args[argSubcmd] == subCmdEnum.REGISTER)
            retMsg = await PartyFinder.registerChannel(msg.channel);
        else if (args[argSubcmd] == subCmdEnum.DEREGISTER)
            retMsg = await PartyFinder.deregisterChannel(msg.channel);
        else if (args[argSubcmd] == subCmdEnum.ADD) {
            var partyChannel = args[argExtraParam];
            if (partyChannel != '' && partyChannel.guild != undefined) {
                retMsg = await PartyFinder.addPartyChannel(msg.channel, partyChannel);
            }
        }else if (args[argSubcmd] == subCmdEnum.CLEAR) {
            retMsg = await PartyFinder.clearPartyChannel(msg.channel);
        }

        if (retMsg)
            msg.channel.send(retMsg);
    }
}