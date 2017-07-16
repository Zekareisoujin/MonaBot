const commando = require('discord.js-commando');

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
                'pf'
            ],
            'guildOnly': true
        });
    }

    async run(msg, args) {
        const PartyFinder = this.client.PartyFinder;

        if (PartyFinder.isMonitored(msg.channel)) {
            var pflist = PartyFinder.retrievePFUsers(msg.channel);
            
            function getString(list) {
                if (list != undefined)
                    return list.join('\n');
                else
                    return '';
            }

            var ret = [
                '** Looking for more ***',
                getString(pflist[PartyFinder.TYPE_LFM]),
                '** Looking for group (Attacker) ***',
                getString(pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.attack.name]),
                '** Looking for group (Breaker) ***',
                getString(pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.break.name]),
                '** Looking for group (Defender) ***',
                getString(pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.defend.name]),
                '** Looking for group (Support) ***',
                getString(pflist[PartyFinder.TYPE_LFG][PartyFinder.roleSpecs.support.name]),
            ];

            return msg.channel.send(getString(ret), {
                code: 'Markdown'
            });

        }else {
            return msg.channel.send("This channel is not a Party Finder channel.");
        }
    }
}