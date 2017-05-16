const TimeUtil = require('../util/TimeUtil.js');

module.exports = class EventCalendarDB {
    constructor(db) {
        this.db = db;
    }

    async init() {
        let eventPromise = this.db.run('CREATE TABLE IF NOT EXISTS events ( \
            id INTEGER PRIMARY KEY, \
            content TEXT NOT NULL, \
            tag TEXT, \
            guild TEXT, \
            start_time DATE NOT NULL, \
            end_time DATE \
        )');

        let modPromise = this.db.run('CREATE TABLE IF NOT EXISTS moderators ( \
            guild TEXT NOT NULL, \
            role TEXT NOT NULL, \
            PRIMARY KEY (guild, role) \
        )');

        return await Promise.all([eventPromise, modPromise]);
    }

    async createEvent(content, tag, guild, startTime) {
        return await this.db.run('INSERT INTO events (content, tag, guild, start_time) VALUES (?,?,?,?)', [
            content,
            tag,
            guild,
            startTime
        ]);
    }

    async createEvent(content, tag, guild, startTime, endTime) {
        return await this.db.run('INSERT INTO events (content, tag, guild, start_time, end_time) VALUES (?,?,?,?,?)', [
            content,
            tag,
            guild,
            startTime,
            endTime
        ]);
    }

    async fetchUpcomingEvents(tag, guild) {
        return await this.db.all('SELECT * FROM events \
            WHERE start_time > ? \
            AND tag = ? AND guild = ? \
        ', [
                TimeUtil.getTimeObject(),
                tag,
                guild
            ]);
    }

    async fetchOngoingEvents(tag, guild) {
        let now = TimeUtil.getTimeObject();
        return await this.db.all('SELECT * FROM events \
            WHERE start_time <= ? \
            AND end_time > ? \
            AND tag = ? AND guild = ? \
        ', [
                now,
                now,
                tag,
                guild
            ]);
    }

    async deleteEvent(id) {
        return await this.db.run('DELETE FROM events WHERE id = ?', [id]);
    }

    async addModerator(guild, role) {
        return await this.db.run('INSERT INTO moderators (guild, role) VALUES (?,?)', [
            guild,
            role
        ]);
    }

    async listModerators(guild) {
        return await this.db.all('SELECT * FROM moderators WHERE guild = ?', [
            guild
        ]);
    }

    // async checkModerator(guild, role) {
    //     return await this.db.get('SELECT * FROM moderators WHERE guild = ? AND role = ?', [
    //         guild,
    //         role
    //     ]);
    // }

    async removeModerator(guild, role) {
        return await this.db.run('DELETE FROM moderators WHERE guild = ? AND role = ?', [
            guild,
            role
        ]);
    }
}