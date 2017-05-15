module.exports = class EventCalendarDB {
    constructor(db) {
        this.db = db;
    }

    async init() {
        await this.db.run('CREATE TABLE IF NOT EXISTS events ( \
            id INTEGER PRIMARY KEY, \
            content TEXT NOT NULL, \
            tag TEXT, \
            guild TEXT, \
            start_time DATE NOT NULL, \
            end_time DATE \
        )');
        return this;
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
            WHERE start_time > datetime("now") \
            AND tag = ? AND guild = ? \
        ', [
            tag,
            guild
        ]);
    }

    async fetchOngoingEvents(tag, guild) {
        return await this.db.all('SELECT * FROM events \
            WHERE start_time <= datetime("now") \
            AND end_time > datetime("now") \
            AND tag = ? AND guild = ? \
        ', [
            tag,
            guild
        ]);
    }

    async deleteEvent(id) {
        return await this.db.run('DELETE FROM events WHERE id = ?', [id]);
    }
}