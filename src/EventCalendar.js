module.exports = class EventCalendar {

    /**
     * @param {EventCalendarDB} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Create an event & add it to database
     * @return reply string containing result
     */
    async createEvent(content, tag, guild, startTime, endTime) {
        // TODO: pending implementation
    }

    /**
     * List all ongoing & upcoming events with ID
     * @return formatted reply string listing all active events & their ID
     */
    async listActiveEventWithID() {
        // TODO: pending implementation
    }

    /**
     * List all ongoing & upcoming events
     * @return formatted reply string listing all active events
     */
    async listActiveEventWith() {
        // TODO: pending implementation
    }

    /**
     * Remove an event by its ID
     * @return reply string containing result
     */
    async deleteEvent(id) {
        // TODO: pending implementation
    }

}