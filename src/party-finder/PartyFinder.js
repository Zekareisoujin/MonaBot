const PFSequelize = require('./PFSequelize.js');

const DEFAULT_TIME_OUT = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_PERIOD = 1 * 60 // 1 minute

const TYPE_LFG = 'lfg';
const TYPE_LFM = 'lfm';

const ROLE_SPEC = {
    'attack': {
        name: 'Attacker',
        regex: /attack/i
    },

    'break': {
        name: 'Breaker',
        regex: /break/i
    },

    'defend': {
        name: 'Defender',
        regex: /defend/i
    },

    'support': {
        name: 'Support',
        regex: /support/i
    }
}

module.exports = class PartyFinder {

    /**
     * 
     * @param {Sequelize} sequelizeClient
     */
    constructor(sequelizeClient) {
        this.db = new PFSequelize(sequelizeClient);
        const db = this.db;
        this.monitoredChannels = {};
        const monitoredChannels = this.monitoredChannels;

        this.partyMemberDB = {};
        this.monitoredPartyChannels = {};
        this.roleSpecs = ROLE_SPEC;
        this.TYPE_LFG = TYPE_LFG;
        this.TYPE_LFM = TYPE_LFM;

        db.init()
            .then(() => {
                return db.fetchAllChannel();
            })
            .then((channelList) => {
                channelList.forEach((channel) => {
                    monitoredChannels[channel.channel] = channel;
                    this.populatePartyChannelMonitor(channel);
                });
            })
            .catch((err) => {
                console.error('Unable to initialize party finder database', err);
                throw err;
            });
    }

    populatePartyChannelMonitor(channel) {
        for (var partyChannelId of channel.partyChannel) {
            if (this.monitoredPartyChannels[partyChannelId] == undefined)
                this.monitoredPartyChannels[partyChannelId] = [];
            if (this.monitoredPartyChannels.indexOf(channel.channel) < 0)
                this.monitoredPartyChannels.push(channel.channel);
        }
    }

    /**
     * 
     * @param {Channel} channel Discord JS Channel object
     * @param {int} [opts_timeOut] Time out duration in seconds.
     * @param {int} [opts_refreshPeriod] Refresh period in seconds.
     */
    async registerChannel(channel, opts_timeOut, opts_refreshPeriod) {
        const db = this.db;
        const channelList = this.monitoredChannels;
        if (channelList[channel.id] != undefined)
            return "This channel has already been registered.";

        var timeOut = (opts_timeOut == undefined ? DEFAULT_TIME_OUT : opts_timeOut);
        var refreshPeriod = (opts_refreshPeriod == undefined ? DEFAULT_REFRESH_PERIOD : opts_refreshPeriod);
        return await Promise.resolve(channel)
            .then(() => {
                return db.registerPFChannel(channel.id, [], timeOut, refreshPeriod)
            })
            .then((pfChannel) => {
                channelList[pfChannel.channel] = pfChannel;
                return "Channel registered successfully.";
            })
            .catch((err) => {
                console.error("Error while registering PF channel: " + err);
                return "Error while registering PF channel: " + err;
            })
    }

    /**
     * 
     * @param {Channel} channel Discord JS Channel object
     */
    async deregisterChannel(channel) {
        const db = this.db;
        const channelList = this.monitoredChannels;
        if (channelList[channel.id] == undefined)
            return "This channel has not yet been registered.";

        return await Promise.resolve(channel)
            .then(() => {
                db.removePFChannel(channel.id)
            })
            .then(() => {
                delete channelList[channel.id];
                return "Channel deregistered successfully.";
            })
            .catch((err) => {
                console.error("Error while deregistering PF channel: " + err);
                return "Error while deregistering PF channel: " + err;
            })
    }

    async addPartyChannel(pfChannel, partyChannel) {
        const db = this.db;
        const channelList = this.monitoredChannels;
        if (channelList[pfChannel.id] == undefined)
            return "This channel has not yet been registered.";

        var partyChannelList = channelList[pfChannel.id].partyChannel;
        if (partyChannelList.indexOf(partyChannel.id) < 0) {
            partyChannelList.push(partyChannel.id);
            return await Promise.resolve()
                .then(() => {
                    db.updatePFChannel(pfChannel.id, 'partyChannel', partyChannelList);
                })
                .catch((err) => {
                    partyChannelList.splice(partyChannelList.indexOf(partyChannel.id), 1);
                    console.error("Error while adding party channel: " + err);
                    return "Error while adding party channel: " + err;
                })
        } else
            return "This party channel has already been added.";
    }

    async clearPartyChannel(pfChannel) {
        const db = this.db;
        const channelList = this.monitoredChannels;
        if (channelList[pfChannel.id] == undefined)
            return "This channel has not yet been registered.";

        return await Promise.resolve()
            .then(() => {
                db.updatePFChannel(pfChannel.id, 'partyChannel', []);
            })
            .then(() => {
                channelList[pfChannel.id].partyChannel = [];
                return "Party channels cleared.";
            })
            .catch((err) => {
                console.error("Error while clearing party channel: " + err);
                return "Error while clearing party channel: " + err;
            })
    }

    /**
     * 
     * @param {Channel} channel 
     */
    isMonitored(channel) {
        return (this.monitoredChannels[channel.id] != undefined);
    }

    /**
     * 
     * @param {User} user Discord JS User object
     * @param {Channel} channel Discord JS Channel object
     * @param {Array} roleList Array of roles requested
     */
    updateUser(user, channel, roleList, type) {
        if (this.partyMemberDB[channel.id] == undefined)
            this.partyMemberDB[channel.id] = {};

        const channelConfig = this.monitoredChannels[channel.id];
        const now = (new Date()).getTime();
        const timeOutThreshold = now - channelConfig.timeOut * 1000;
        const userDB = this.partyMemberDB[channel.id];
        const userKey = user.username;

        if (userDB[userKey] != undefined) {
            var userPF = userDB[userKey];
            if (userPF.queueTime < timeOutThreshold)
                userPF.queueTime = now;
            userPF.roleList = roleList;
            userPF.type = type;
        } else {
            userDB[userKey] = {
                queueTime: now,
                roleList: roleList,
                type: type
            }
        }
    }


    monitorPartyChannel(msg) {
        const channel = msg.channel;
        if (this.monitoredPartyChannels[channel.id] != undefined) {
            // if this channel is being monitored
            for (var pfChannelId of this.monitoredPartyChannels[channel.id]) {
                // check against all PF channel that this party channel belongs to
                const user = msg.author;
                const userDB = this.partyMemberDB[pfChannelId];
                if (userDB[user.id] != undefined) {
                    if (userDB[user.id].type == TYPE_LFM) {
                        // if the one LFG does not post a room number, keep him
                        if (/^[0-9]{4,8}$/.exec(msg.content) == null)
                            return;
                    }
                    delete userDB[user.id];
                }
            }
        }
    }

    /**
     * 
     * @param {Channel} channel Discord JS Channel object
     */
    retrievePFUsers(channel) {
        const channelConfig = this.monitoredChannels[channel.id];
        const now = (new Date()).getTime();
        const timeOutThreshold = now - channelConfig.timeOut * 1000;
        const userDB = this.partyMemberDB[channel.id];

        var ret = {};
        ret[TYPE_LFG] = {};
        ret[TYPE_LFM] = [];

        for (var userId in userDB) {
            const userPF = userDB[userId];

            if (userPF.queueTime > timeOutThreshold) {
                if (userPF.type == TYPE_LFM) {
                    ret[TYPE_LFM].push(userId);
                } else {
                    for (var role of userPF.roleList) {
                        if (ret[userPF.type][role] == undefined)
                            ret[userPF.type][role] = [];
                        ret[userPF.type][role].push(userId);
                    }
                }
            }
        }

        var sortFunc = function (left, right) {
            return userDB[left] > userDB[right];
        }

        for (var role in ret[TYPE_LFG])
            ret[TYPE_LFG][role].sort(sortFunc);
        ret[TYPE_LFM].sort(sortFunc);

        return ret;
    }

}