const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const TimeUtil = require('../util/TimeUtil.js');


module.exports = class CalendarSequelize {
    constructor(config) {
        this.sequelize = new Sequelize(config);
    }

    async init() {
        const sequelize = this.sequelize;
        await sequelize.authenticate();
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
                    $gte: TimeUtil.getTimeObject()
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
                    $lt: now
                },
                end_time: {
                    $gte: now
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
                $or: [
                    {
                        start_time: {
                            $gte: now
                        }
                    }, {
                        end_time: {
                            $gte: now
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

    async deleteEvent(id) {
        return await this.Event.destroy({
            where: {
                id: id
            }
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
