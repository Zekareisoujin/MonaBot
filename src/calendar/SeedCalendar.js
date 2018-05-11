const util = require('util');
const TimeUtil = require('../util/TimeUtil.js');

const SEED_ROTATION = [
    'Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark'
]

const BOOST_STAT = [
    'HP', 'Attack', 'Break', 'Magic'
]

const BASE_DATE = new Date('2018-05-11');
const BASE_IDX = 3;

module.exports = class SeedCalendar {

    constructor() {
        this.seedRotation = SEED_ROTATION;
        this.baseDate = BASE_DATE;
        this.baseIndex = BASE_IDX;
        this.boostStat = BOOST_STAT;
        this.messageList = {};
    }

    /**
     * 
     * @param {string} selectedDateString
     */
    getSeedRotation(selectedDateString) {
        var selectedDate = new Date(selectedDateString);
        if (selectedDate.toString() === 'Invalid Date')
            throw selectedDate;

        var timeDiff = Math.abs(selectedDate.getTime() - this.baseDate.getTime());
        var diffInDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        var actualIndex = (this.baseIndex + diffInDays) % this.seedRotation.length;
        var seedRotation1 = [], seedRotation2 = [];
        for (var i=0; i<this.boostStat.length; i++) {
            seedRotation1.push(this.seedRotation[(i + actualIndex) % this.seedRotation.length]);
            seedRotation2.push(this.seedRotation[(i + actualIndex + 1) % this.seedRotation.length]);
        }
        return {
            date: selectedDate,
            stat: this.boostStat,
            seedRotation: [seedRotation1, seedRotation2]
        };
    }

    getLatestMessage(channel) {
        if (this.messageList[channel.id] != undefined)
            return this.messageList[channel.id];
        else
            return null;
    }

    setLatestMessage(channel, message) {
        this.messageList[channel.id] = message;
    }
}