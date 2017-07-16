const commando = require('discord.js-commando');

module.exports = class LFTrigger extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'lf-trigger',
            'group': 'party-finder',
            'memberName': 'lf-trigger',
            'description': 'Catching LFG/LFM messages.',
            'guildOnly': true,
            'defaultHandling': false,
            'patterns': [
                // /lf(?:[1-3]m|g) +([^]*)/i
                /lf([1-3]?m|g)/i
            ]
        });
    }

    async run(msg, args) {
        const PartyFinder = this.client.PartyFinder;
        const roleSpecs = PartyFinder.roleSpecs;

        if (PartyFinder.isMonitored(msg.channel)) {
            const type = args[1].substr(args[1].length - 1).toLowerCase();
            var roleList = [];

            for (var role in roleSpecs) {
                if (roleSpecs[role].regex.exec(args.input) != null)
                    roleList.push(roleSpecs[role].name);
            }
            if (roleList.length == 0)
                for (var role in roleSpecs)
                    roleList.push(roleSpecs[role].name);

            if (type == 'g')
                return this.registerLFG(msg, roleList);
            else if (type == 'm') {
                return this.registerLFM(msg, roleList);
            }
        }
    }

    registerLFG(msg, roleList) {
        const PartyFinder = this.client.PartyFinder;
        PartyFinder.updateUser(msg.author, msg.channel, roleList, PartyFinder.TYPE_LFG);
        console.log('Looking for group: ' + roleList.join('/'));
        
    }

    registerLFM(msg, roleList) {
        const PartyFinder = this.client.PartyFinder;
        PartyFinder.updateUser(msg.author, msg.channel, roleList, PartyFinder.TYPE_LFM);
        console.log('Looking for group: ' + roleList.join('/'));
    }
}