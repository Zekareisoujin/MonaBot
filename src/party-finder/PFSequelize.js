const fs = require('fs');
const path = require('path');
const TimeUtil = require('../util/TimeUtil.js');

const VALUE_SEPARATOR = ',';

module.exports = class PFSequelize {
    constructor(sequelizeClient) {
        this.sequelize = sequelizeClient;
    }

    async init() {
        const sequelize = this.sequelize;
        const dbSync = [];

        fs
            .readdirSync(path.join(__dirname, 'models'))
            .forEach(file => {
                var model = sequelize.import(path.join(__dirname, 'models', file));
                this[model.name] = model;
                dbSync.push(model.sync());
            });

        return await Promise.all(dbSync);
    }

    /**
     * 
     * @param {String} channel Channel ID
     * @param {Array} partyChannelList Array of channel ID
     * @param {int} timeOut Time out in seconds
     * @param {int} refreshPeriod Refresh period in seconds
     */
    async registerPFChannel(channel, partyChannelList, timeOut, refreshPeriod) {
        var partyChannel = partyChannelList.join(VALUE_SEPARATOR);
        return await this.PFChannel.create({
            channel: channel,
            partyChannel: partyChannel,
            timeOut: timeOut,
            refreshPeriod: refreshPeriod
        });
    }

    /**
     * 
     * @param {String} channel Channel ID
     * @param {String} field Channel attribute
     * @param {Array|Integer} value Attribute value
     */
    async updatePFChannel(channel, field, value) {
        if (field === 'partyChannel')
            value = value.join(VALUE_SEPARATOR);
        
        return await this.PFChannel.findById(channel)
            .then((pfChannel) => {
                if (!pfChannel)
                    return Promise.reject("Channel has not been registered.");

                pfChannel[field] = value;
                return pfChannel.save({
                    fields: [field]
                });
            })
    }

    // async fetchChannelConfig(channel) {
    //     return await this.PFChannel.findById(channel)
    //         .then((pfChannel) => {
    //             if (!pfChannel)
    //                 return Promise.reject("Channel has not been registered.");

    //             return pfChannel;
    //         })
    // }

    async fetchAllChannel() {
        let res = await this.PFChannel.findAll();
        res.forEach((row) => {
            if (row.partyChannel != '')
                row.partyChannel = row.partyChannel.split(VALUE_SEPARATOR);
            else
                row.partyChannel = [];
        })
        return res;
    }

    async removePFChannel(channel) {
        return await this.PFChannel.findById(channel)
            .then((pfChannel) => {
                if (!pfChannel)
                    return Promise.reject("Channel has not been registered.");

                return pfChannel.destroy();
            })
    }

    // /**
    //  * 
    //  * @param {String} member Member ID
    //  * @param {String} channel Channel ID
    //  * @param {Array} roleList List of role registered by this member
    //  * @param {Date} queue_time Last queue time
    //  */
    // async createUser(member, channel, roleList, queue_time) {
    //     var role = roleList.join(VALUE_SEPARATOR);
    //     return await this.PartyMember.create({
    //         member: member,
    //         channel: channel,
    //         role: role,
    //         queue_time: queue_time
    //     });
    // }

    // /**
    //  * 
    //  * @param {String} member Member ID
    //  * @param {String} channel Channel ID
    //  * @param {Array} roleList List of role registered by this member
    //  * @param {Date} queue_time Last queue time
    //  */
    // async updateUser(member, channel, roleList, queue_time) {
    //     var role = roleList.join(VALUE_SEPARATOR);
    //     return await this.PartyMember.findAll({
    //         where: {
    //             member: member,
    //             channel: channel
    //         }
    //     })
    //         .then((userList) => {
    //             if (userList.length <= 0)
    //                 return Promise.reject("User has not been registered.");

    //             userList[0].role = role;
    //             userList[0].queue_time = queue_time;
    //             return pfChannel.save({
    //                 fields: [role, queue_time]
    //             });
    //         })
    // }

    // async fetchUserDetails(member, channel) {
    //     return await this.PartyMember.findAll({
    //         where: {
    //             member: member,
    //             channel: channel
    //         }
    //     })
    //         .then((userList) => {
    //             if (userList.length <= 0)
    //                 return Promise.reject("User has not been registered.");

    //             return userList[0];
    //         })
    // }
}