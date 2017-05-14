const EventDB = require('./src/EventCalendarDB.js');
const TimeUtil = require('./src/TimeUtil.js');
const sqlite = require('sqlite');
const path = require('path');
const util = require('util');
const moment = require('moment-timezone');

var eventDB;
sqlite.open(path.join(__dirname, 'events.sqlite3'))
    .then((db) => {
        eventDB = new EventDB(db);
        return eventDB.init();
    })
    .then((eventDB) => {
        return eventDB.fetchUpcomingEvents('test', '50148659995607040');
    })
    .then((evtData) => {
        console.log(evtData);
        var startTime = TimeUtil.getTimeObject(evtData[0]['start_time']);
        console.log(startTime);
        console.log(TimeUtil.getTimeDifference(startTime));
    })
    .catch(console.error);

// console.log(moment(new Date('2017-05-20 19:00 UTC-8')).format());
// console.log(new Date('2017-05-20 19:00 UTC-8'));