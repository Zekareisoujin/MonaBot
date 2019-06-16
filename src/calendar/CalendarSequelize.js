const fs = require('fs');
const path = require('path');
const TimeUtil = require('../util/TimeUtil.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = class CalendarSequelize {
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

    async createEvent(content, tag, guild, startTime) {
        return await this.Event.create({
            content: content,
            tag: tag,
            guild: guild,
            start_time: startTime
        });
    }

    async createEvent(content, tag, guild, startTime, endTime) {
        return await this.Event.create({
            content: content,
            tag: tag,
            guild: guild,
            start_time: startTime,
            end_time: endTime
        });
    }

    async fetchUpcomingEvents(tag, guild) {
        return await this.Event.findAll({
            where: {
                tag: tag,
                guild: guild,
                start_time: {
                    [Op.gte]: TimeUtil.getTimeObject()
                }
            },
            order: ['start_time']
        });
    }

    async fetchOngoingEvents(tag, guild) {
        let now = TimeUtil.getTimeObject();
        return await this.Event.findAll({
            where: {
                tag: tag,
                guild: guild,
                start_time: {
                    [Op.lt]: now
                },
                end_time: {
                    [Op.gte]: now
                }
            },
            order: ['end_time']
        });
    }

    async fetchActiveEventTags(guild) {
        let now = TimeUtil.getTimeObject();
        let res = await this.Event.findAll({
            attributes: ['tag'],
            where: {
                guild: guild,
                [Op.or]: [
                    {
                        start_time: {
                            [Op.gte]: now
                        }
                    }, {
                        end_time: {
                            [Op.gte]: now
                        }
                    }
                ]
            }
        });

        // Limitation
        let resultSet = new Set();
        let ret = [];
        res.forEach((row) => {
            if (!resultSet.has(row.tag)) {
                resultSet.add(row.tag);
                ret.push(row);
            }
        })
        return ret;
    }

    async updateEvent(id, field, value, guild) {
        return await this.Event.findById(id)
            .then((event) => {
                if (!event || event.guild != guild)
                    return Promise.reject("Event does not exist.");

                event[field] = value;
                return event.save({
                    fields: [field]
                });
            })
    }

    async deleteEvent(id, guild) {
        return await this.Event.findById(id)
            .then((event) => {
                if (!event || event.guild != guild)
                    return Promise.reject("Event does not exist.");

                return event.destroy();
            });
    }

    async addModerator(guild, role) {
        return await this.Moderator.create({
            guild: guild,
            role: role
        });
    }

    async listModerators(guild) {
        return await this.Moderator.findAll({
            where: {
                guild: guild
            }
        });
    }

    async listAllModerators() {
        return await this.Moderator.findAll();
    }

    async removeModerator(guild, role) {
        return await this.Moderator.destroy({
            where: {
                guild: guild,
                role: role
            }
        })
    }
}
