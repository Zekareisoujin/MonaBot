const EventCalendarDB = require('./src/calendar/EventCalendarDB.js');
const EventCalendar = require('./src/calendar/EventCalendar.js');
const TimeUtil = require('./src/util/TimeUtil.js');
const sqlite = require('sqlite');
const path = require('path');
const util = require('util');
const moment = require('moment-timezone');

var eventDB;
var eventCalendar;
// Promise.resolve()
//     .then(() => {
//         return sqlite.open(path.join(__dirname, 'events.sqlite3'))
//     })
//     .then((db) => {
//         eventDB = new EventCalendarDB(db);
//         return eventDB.init();
//     })
//     .then((eventDB) => {
//         eventCalendar = new EventCalendar(eventDB);
//         return eventCalendar.createEvent('this content', 'test', '50148659995607040', '2017-05-15 19:00:00 UTC-8', '2017-05-15 20:00:00 UTC-8');
//         // console.log("API pre-result: " + result);
//         // return Promise.resolve(result);
//     }).then(() => {
//         // return eventDB.fetchUpcomingEvents('test', '50148659995607040');
//         return eventCalendar.listActiveEventsWithID('test', '50148659995607040');
//     })
//     .then((evtData) => {
//         console.log(evtData);
//         // var startTime = TimeUtil.getTimeObject(evtData[0]['start_time']);
//         var startTime = new Date(evtData[0]['start_time']);
//         console.log('start time: ' + startTime);
//         console.log(TimeUtil.getTimeDifference(startTime));
//     })
//     .catch(console.error);

async function run() {
    var result;
    var db = await sqlite.open(path.join(__dirname, 'events.sqlite3'));
    eventDB = new EventCalendarDB(db);
    eventCalendar = new EventCalendar(eventDB);
    result = await eventCalendar.createEvent('this content', 'test', '50148659995607040', '2017-05-15 19:00:00 UTC-8', '2017-05-15 20:00:00 UTC-8');
    console.log(result);
    result = await eventCalendar.listActiveEventsWithID('test', '50148659995607040');
    // result = await eventDB.fetchOngoingEvents('test', '50148659995607040');
    console.log(result);
    result = await eventCalendar.listActiveEvents('test', '50148659995607040');
    // result = await eventDB.fetchOngoingEvents('test', '50148659995607040');
    console.log(result);
}

run();

// console.log(moment(new Date('2017-05-20 19:00 UTC-8')).format());
// console.log(new Date('2017-05-20 19:00 UTC-8'));
// console.log(TimeUtil.getTimeObject('2017-05-15 19:00:00 UTC-8'));