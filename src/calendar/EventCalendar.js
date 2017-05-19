const util = require('util');
const TimeUtil = require('../util/TimeUtil.js');

module.exports = class EventCalendar {

    /**
     * @param {EventCalendarDB} db
     */
    constructor(db) {
        this.db = db;
        this.moderatorRoles = new Set();
        db.init()
            .then(() => {
                return db.listAllModerators();
            })
            .then((roleList) => {
                roleList.forEach((role) => this.moderatorRoles.add(role.role));
            })
            .catch((err) => {
                console.error('Unable to initialize database', err);
                throw err;
            });
    }

    /**
     * Create an event & add it to database
     * @param {string} content - event content/description
     * @param {string} tag - event tag/classification
     * @param {string} guildId - guild ID
     * @param {string} startTime - event start time
     * @param {?string} endTime - event end time
     * @return promise that resolve into reply string containing result
     */
    async createEvent(content, tag, guildId, startTime, endTime) {
        const db = this.db
        return await Promise.resolve()
            .then(() => {
                // TODO: handle time error, or throw exception from time util
                let startDateTime = TimeUtil.getTimeObject(startTime);
                if (endTime && endTime.length > 0) {
                    let endDateTime = TimeUtil.getTimeObject(endTime);
                    return db.createEvent(content, tag, guildId, startDateTime, endDateTime);
                } else
                    return db.createEvent(content, tag, guildId, startDateTime);
            })
            .then(() => {
                return "Event created successfully!"; //TODO: insert 👌
            })
            .catch((err) => {
                console.error(err);
                return "Error while creating event: " + err;
            });
    }

    /**
     * List all ongoing & upcoming events with ID
     * @param {string} tag - event tag/classification
     * @param {string} guildId - guild ID
     * @return promise that resolve into formatted reply string listing all active events & their ID
     */
    async listActiveEventsWithID(tag, guildId) {
        const db = this.db;
        return await Promise.all([
            db.fetchUpcomingEvents(tag, guildId),
            db.fetchOngoingEvents(tag, guildId)
        ]).then(([upcoming, ongoing]) => {
            let ret = [];

            if (upcoming.length > 0 || ongoing.length > 0) {
                ret.push('#ID. Content - Start Time - End Time');
                upcoming.concat(ongoing).forEach((event) => {
                    ret.push(util.format(
                        "%d. %s - %s - %s",
                        event.id,
                        event.content,
                        event.start_time,
                        (event.end_time ? event.end_time : 'indefinitely')
                    ));
                });
            }

            if (ret.length == 0)
                ret.push('There is no active event at the moment.');

            return util.format('```Markdown\n%s```', ret.join('\n'));
        }).catch((err) => {
            console.error("Error while retrieving events", err);
            return "Failed to retrieve events: " + err;
        });
    }

    /**
     * List all ongoing & upcoming events
     * @param {string} tag - event tag/classification
     * @param {string} guildId - guild ID
     * @return promise that resolve into formatted reply string listing all active events
     */
    async listActiveEvents(tag, guildId) {
        const db = this.db;
        return await Promise.all([
            db.fetchUpcomingEvents(tag, guildId),
            db.fetchOngoingEvents(tag, guildId)
        ]).then(([upcoming, ongoing]) => {
            let ret = [];

            if (ongoing.length > 0) {
                ret.push('# Ongoing events');
                ongoing.forEach((event) => {
                    ret.push(util.format(
                        '- %s < %s >',
                        event.content,
                        TimeUtil.getTimeDifference(event.end_time)
                    ));
                });
                ret.push('');
            }

            if (upcoming.length > 0) {
                ret.push('# Upcoming events');
                upcoming.forEach((event) => {
                    ret.push(util.format(
                        '- %s < %s >',
                        event.content,
                        TimeUtil.getTimeDifference(event.start_time)
                    ));
                });
            }

            if (ret.length == 0)
                ret.push('There is no active event under this tag.');

            return util.format('```Markdown\n%s```', ret.join('\n'));
        }).catch((err) => {
            console.error("Error while retrieving events", err);
            return "Failed to retrieve events: " + err;
        });
    }

    /**
     * List all active event tags
     * @return promise that resolve into reply string containing result
     */
    async listActiveEventTags(guildId) {
        return await this.db.fetchActiveEventTags(guildId)
            .then((tags) => {
                let ret = [];
                tags.forEach((tag) => {
                    ret.push(tag.tag);
                });

                if (ret.length == 0)
                    ret.push('There is no active event at the moment.');
                
                return util.format('```%s```', ret.join(', '));
            })
            .catch((err) => {
                console.error("Error while retrieving event tags", err);
                return "Failed to retrieve event tags: " + err;
            })
    }

    /**
     * Remove an event by its ID
     * @return promise that resolve into reply string containing result
     */
    async deleteEvent(id) {
        const db = this.db
        return await Promise.resolve()
            .then(() => {
                return db.deleteEvent(id);
            })
            .then(() => {
                return "Event deleted successfully!";
            })
            .catch((err) => {
                console.error("Error while deleting event", err);
                return "Failed to delete event: " + err;
            });
    }

    async addModerator(guildId, roleId) {
        const db = this.db;
        return await Promise.resolve()
            .then(() => {
                return db.addModerator(guildId, roleId);
            })
            .then(() => {
                this.moderatorRoles.add(roleId);
                return "Moderator role added successfully!";
            })
            .catch((err) => {
                // TODO: catch duplicate mod addition
                console.error("Error while adding moderator role", err);
                return "Failed to add moderator role: " + err;
            });
    }

    async listModerators(guild) {
        const db = this.db;
        return await Promise.resolve()
            .then(() => {
                return db.listModerators(guild.id);
            })
            .then((moderatorRoleList) => {
                let ret = [];
                moderatorRoleList.forEach((modRole) => ret.push(guild.roles.get(modRole.role).name));

                if (ret.length == 0)
                    ret.push('There is no moderator role for this server at the moment.');

                return util.format('```%s```', ret.join(', '));
            })
            .catch((err) => {
                console.error("Error while retrieving moderator role list", err);
                return "Failed to list moderator roles: " + err;
            });
    }

    async removeModerator(guildId, roleId) {
        const db = this.db
        return await Promise.resolve()
            .then(() => {
                return db.removeModerator(guildId, roleId);
            })
            .then(() => {
                this.moderatorRoles.delete(roleId);
                return "Moderator role successfully removed!";
            })
            .catch((err) => {
                console.error("Error while removing moderator role", err);
                return "Failed to remove moderator role: " + err;
            })
    }

    /**
     * Check permission for modifying events
     * @return {boolean}
     */
    hasModeratorPermission(guild, member) {
        if (!guild)
            return false;

        let hasPermission = false;
        member.roles.forEach((role) => {
            // console.log('Checking role: ' + role.id);
            if (this.moderatorRoles.has(role.id))
                hasPermission = true;
        })

        return member.hasPermission('ADMINISTRATOR') || hasPermission;
    }
}