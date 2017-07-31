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
        this.monitoredChannels = {};
        this.monitoredPartyChannels = {};
        this.partyMemberDB = {};
        this.pfUpdater = {};

        this.roleSpecs = ROLE_SPEC;
        this.TYPE_LFG = TYPE_LFG;
        this.TYPE_LFM = TYPE_LFM;
        const populatePartyChannelMonitor = this.populatePartyChannelMonitor;

        this.db.init()
            .then(() => {
                return this.db.fetchAllChannel();
            })
            .then((channelList) => {
                channelList.forEach((channel) => {
                    this.monitoredChannels[channel.channel] = channel;
                    this.partyMemberDB[channel.channel] = {};
                    this.populatePartyChannelMonitor(channel);
                });
            })
            .catch((err) => {
                console.error('Unable to initialize party finder database', err);
                throw err;
            });
    }

    /**
     * 
     * @param {PFChannel} pfChannel 
     * @param {String} partyChannelId 
     */
    populatePartyChannelMonitor(pfChannel, partyChannelId) {
        if (partyChannelId == undefined) {
            for (var partyChannelId of pfChannel.partyChannel) {
                this.addPartyChannelMonitor(pfChannel.channel, partyChannelId);
            }
        } else {
            this.addPartyChannelMonitor(pfChannel.channel, partyChannelId);
        }
    }

    /**
     * 
     * @param {String} pfChannelId 
     * @param {String} partyChannelId 
     */
    addPartyChannelMonitor(pfChannelId, partyChannelId) {
        if (this.monitoredPartyChannels[partyChannelId] == undefined)
            this.monitoredPartyChannels[partyChannelId] = [];
        if (this.monitoredPartyChannels[partyChannelId].indexOf(pfChannelId) < 0)
            this.monitoredPartyChannels[partyChannelId].push(pfChannelId);
    }

    /**
     * 
     * @param {PFChannel} pfChannel 
     */
    clearPartyChannelMonitor(pfChannel) {
        for (var partyChannelId of pfChannel.partyChannel) {
            const channelList = this.monitoredPartyChannels[partyChannelId];
            if (channelList != undefined && channelList.indexOf(pfChannel.channel) >= 0) {
                channelList.splice(channelList.indexOf(pfChannel.channel), 1);
            }
        }
        pfChannel.partyChannel = [];
    }

    /**
     * 
     * @param {Channel} channel Discord JS Channel object
     * @param {int} [opts_timeOut] Time out duration in seconds.
     * @param {int} [opts_refreshPeriod] Refresh period in seconds.
     */
    async registerChannel(channel, opts_timeOut, opts_refreshPeriod) {
        const channelList = this.monitoredChannels;
        if (channelList[channel.id] != undefined)
            return "This channel has already been registered.";

        var timeOut = (opts_timeOut == undefined ? DEFAULT_TIME_OUT : opts_timeOut);
        var refreshPeriod = (opts_refreshPeriod == undefined ? DEFAULT_REFRESH_PERIOD : opts_refreshPeriod);
        return await Promise.resolve(channel)
            .then(() => {
                return this.db.registerPFChannel(channel.id, [], timeOut, refreshPeriod)
            })
            .then((pfChannel) => {
                channelList[pfChannel.channel] = pfChannel;
                pfChannel.partyChannel = [];
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
        const channelList = this.monitoredChannels;
        if (channelList[channel.id] == undefined)
            return "This channel has not yet been registered.";

        return await Promise.resolve(channel)
            .then(() => {
                this.db.removePFChannel(channel.id)
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

    /**
     * 
     * @param {Channel} pfChannel 
     * @param {Channel} partyChannel 
     */
    async addPartyChannel(pfChannel, partyChannel) {
        const channelList = this.monitoredChannels;
        if (channelList[pfChannel.id] == undefined)
            return "This channel has not yet been registered.";

        var partyChannelList = channelList[pfChannel.id].partyChannel;
        if (partyChannelList.indexOf(partyChannel.id) < 0) {
            partyChannelList.push(partyChannel.id);
            return await Promise.resolve()
                .then(() => {
                    this.db.updatePFChannel(pfChannel.id, 'partyChannel', partyChannelList);
                })
                .then(() => {
                    this.addPartyChannelMonitor(pfChannel.id, partyChannel.id);
                })
                .catch((err) => {
                    partyChannelList.splice(partyChannelList.indexOf(partyChannel.id), 1);
                    console.error("Error while adding party channel: " + err);
                    return "Error while adding party channel: " + err;
                })
        } else
            return "This party channel has already been added.";
    }

    /**
     * 
     * @param {Channel} pfChannel 
     */
    async clearPartyChannel(pfChannel) {
        const channelList = this.monitoredChannels;
        if (channelList[pfChannel.id] == undefined)
            return "This channel has not yet been registered.";

        return await Promise.resolve()
            .then(() => {
                this.db.updatePFChannel(pfChannel.id, 'partyChannel', []);
            })
            .then(() => {
                this.clearPartyChannelMonitor(channelList[pfChannel.id]);
                //channelList[pfChannel.id].partyChannel = [];
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
     * refresh period in seconds
     * 
     * @param {Channel} channel 
     */
    getChannelRefreshRate(channel) {
        return (this.monitoredChannels[channel.id].refreshPeriod);
    }

    /**
     * 
     * @param {User} user Discord JS User object
     * @param {Channel} channel Discord JS Channel object
     * @param {Array} roleList Array of roles requested
     */
    updateUser(user, channel, roleList, type) {
        const channelConfig = this.monitoredChannels[channel.id];
        const now = (new Date()).getTime();
        const timeOutThreshold = now - channelConfig.timeOut * 1000;
        const userDB = this.partyMemberDB[channel.id];
        const userKey = user.id;

        if (userDB[userKey] != undefined) {
            var userPF = userDB[userKey];
            if (userPF.queueTime < timeOutThreshold)
                userPF.queueTime = now;
            userPF.roleList = roleList;
            userPF.type = type;
        } else {
            userDB[userKey] = {
                name: user.username,
                queueTime: now,
                roleList: roleList,
                type: type
            }
        }

        if (this.pfUpdater[channel.id] != undefined) {
            this.pfUpdater[channel.id].update();
            this.pfUpdater[channel.id].replaceRequired = true;
        }
    }

    /**
     * 
     * @param {Message} msg 
     */
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
                    if (this.pfUpdater[pfChannelId] != undefined) {
                        this.pfUpdater[pfChannelId].update();
                        this.pfUpdater[pfChannelId].replaceRequired = true;
                    }
                    console.log('Removing user ' + user.username + ' from PF');
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
                    ret[TYPE_LFM].push(userPF.name);
                } else {
                    for (var role of userPF.roleList) {
                        if (ret[userPF.type][role] == undefined)
                            ret[userPF.type][role] = [];
                        ret[userPF.type][role].push(userPF.name);
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