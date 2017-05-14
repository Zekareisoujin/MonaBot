const moment = require('moment-timezone');
const util = require('util');

module.exports = class TimeUtil {

    static getTimeObject(timeString) {
        // TODO: implement timezone arg
        // return moment.tz(timeString, 'UTC');
        return new Date(timeString);
    }

    static getTimeDifference(then, now) {
        if (!now) now = moment();
        let diff = moment.duration(moment(then).diff(now));
        let durationString = util.format(
            '%s day(s) %s hour(s) %s minute(s) %s second(s)', 
            diff.get('day'), 
            diff.get('hour'), 
            diff.get('minute'), 
            diff.get('second'));
        return durationString;
    }
}