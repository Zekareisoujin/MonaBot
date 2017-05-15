const util = require('util');
const TimeUtil = require('../util/TimeUtil.js');

module.exports = class EventCalendar {

    /**
     * @param {EventCalendarDB} db
     */
    constructor(db) {
        this.db = db;
        db.init().catch((err) => {
            console.error('Unable to initialize database', err);
            throw err;
        })
    }

    /**
     * Create an event & add it to database
     * @param {string} content - event content/description
     * @param {string} tag - event tag/classification
     * @param {string} guild - guild ID
     * @param {string} startTime - event start time
     * @param {?string} endTime - event end time
     * @return promise that resolve into reply string containing result
     */
    async createEvent(content, tag, guild, startTime, endTime) {
        const db = this.db
        return await Promise.resolve()
            .then(() => {
                let startDateTime = TimeUtil.getTimeObject(startTime);
                if (endTime && endTime.length > 0) {
                    let endDateTime = TimeUtil.getTimeObject(endTime);
                    return db.createEvent(content, tag, guild, startDateTime, endDateTime);
                } else
                    return db.createEvent(content, tag, guild, startDateTime);
            })
            .then(() => {
                return "Event created successfully!"; //TODO: insert 👌
            })
            .catch((err) => {
                console.error(err);
                return "Error while creating event: " + err;
            })
    }

    /**
     * List all ongoing & upcoming events with ID
     * @param {string} tag - event tag/classification
     * @param {string} guild - guild ID
     * @return promise that resolve into formatted reply string listing all active events & their ID
     */
    async listActiveEventsWithID(tag, guild) {
        const db = this.db;
        return await Promise.all([
            db.fetchUpcomingEvents(tag, guild),
            db.fetchOngoingEvents(tag, guild)
        ]).then(([upcoming, ongoing]) => {
            let ret = [];
            ret.push('ID - Content - Start Time - End Time');
            upcoming.concat(ongoing).forEach((event) => {
                ret.push(util.format(
                    "%s - %s - %s - %s",
                    event.id,
                    event.content,
                    event.start_time,
                    (event.end_time ? event.end_time : 'indefinitely')
                ));
            });

            return util.format('```%s```', ret.join('\n'));
        }).catch((err) => {
            console.error("Error while retrieving events", err);
            return "Failed to retrieve events: " + err;
        })
    }

    /**
     * List all ongoing & upcoming events
     * @param {string} tag - event tag/classification
     * @param {string} guild - guild ID
     * @return promise that resolve into formatted reply string listing all active events
     */
    async listActiveEvents(tag, guild) {
        const db = this.db;
        return await Promise.all([
            db.fetchUpcomingEvents(tag, guild),
            db.fetchOngoingEvents(tag, guild)
        ]).then(([upcoming, ongoing]) => {
            let ret = [];

            if (ongoing.length > 0) {
                ret.push('*** Ongoing events ***');
                ongoing.forEach((event) => {
                    ret.push(util.format(
                        '%s - %s',
                        event.content,
                        TimeUtil.getTimeDifference(event.end_time)
                    ));
                });
            }

            if (upcoming.length > 0) {
                ret.push('*** Upcoming events ***');
                upcoming.forEach((event) => {
                    ret.push(util.format(
                        '%s - %s',
                        event.content,
                        TimeUtil.getTimeDifference(event.start_time)
                    ));
                });
            }

            if (ret.length == 0)
                ret.push('There is no active event under this tag.');

            return util.format('```%s```', ret.join('\n'));
        }).catch((err) => {
            console.error("Error while retrieving events", err);
            return "Failed to retrieve events: " + err;
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
            })
    }

    /**
     * Check permission for modifying events
     * @return {boolean}
     */
    hasModeratorPermission(msg) {
        if (!msg.guild)
            return false;

        return msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('MANAGE_NICKNAMES');
    }
}