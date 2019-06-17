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
        
        return await this.PFChannel.findByPk(channel)
            .then((pfChannel) => {
                if (!pfChannel)
                    return Promise.reject("Channel has not been registered.");

                pfChannel[field] = value;
                return pfChannel.save({
                    fields: [field]
                });
            })
    }

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
        return await this.PFChannel.findByPk(channel)
            .then((pfChannel) => {
                if (!pfChannel)
                    return Promise.reject("Channel has not been registered.");

                return pfChannel.destroy();
            })
    }
}