const commando = require('discord.js-commando');

const argDate = 'date';

module.exports = class SeedSchedule extends commando.Command {
    constructor(client) {
        super(client, {
            'name': 'seed-schedule',
            'aliases': [
                'seed', 
                'ss'
            ],
            'group': 'mobius',
            'memberName': 'seed-schedule',
            'description': 'View weapon boost seed rotation for given date',
            'example': [
                'seed-schedule 2018-06-01',
                'seed 2018 june 1'
            ],
            'guildOnly': false,
            'throttling': {
                'usages': 1,
                'duration': 15
            },
            'args': [
                {
                    'key': argDate,
                    'label': 'date',
                    'prompt': 'Specify a date to check.',
                    'type': 'string'
                }
            ]
        });
    }

    async run(msg, args) {
        const SeedCalendar = this.client.SeedCalendar;
                
        var oldMessage = SeedCalendar.getLatestMessage(msg.channel);

        try {
            if (oldMessage != null)
                await oldMessage.delete();
        } catch(e) {
            console.log('Cannot delete old message: ' + e);
        }

        var schedule = SeedCalendar.getSeedRotation(args[argDate]);
        var dateString = schedule.date.getFullYear() + '-' + (schedule.date.getMonth() + 1) + '-' + schedule.date.getDate();
        var sb1 = [], sb2 = [];
        
        for (var i=0; i<schedule.stat.length; i++) {
            sb1.push('- ' + schedule.stat[i] + ': < ' + schedule.seedRotation[0][i] + ' >');
            sb2.push('- ' + schedule.stat[i] + ': < ' + schedule.seedRotation[1][i] + ' >');
        }

        var messageContent = 
            'Weapon Boost seed requirements for ' + dateString + ': \n' +
            '```markdown\n' + 
            '# Before 16:00 UTC-8:\n' +
            sb1.join('\n') + 
            '\n# After 16:00 UTC-8:\n' +
            sb2.join('\n') + 
            '```';
        
        var newMessage = await msg.channel.send(messageContent);
        SeedCalendar.setLatestMessage(msg.channel, newMessage);

        return newMessage;
    }
}
