const moment = require('moment-timezone');
const util = require('util');

module.exports = class TimeUtil {

    /**
     * Generate an accepted time object
     * TODO: implement timezone consideration & proper time object
     * @param {string} timeString - input string by user
     * @return {string} - accepted date object to be consumed by other API
     */
    static getTimeObject(timeString) {
        // return moment.tz(timeString, 'UTC');
        return moment.tz(new Date(timeString), 'UTC').format();
    }

    /**
     * Generate the time difference in string
     * TODO: use accepted time object as input, instead of string
     * @param {string} then - target point in time
     * @param {?string} now - reference point in time
     * @return {string} - output time difference string
     */
    static getTimeDifference(then, now) {
        if (!now) now = moment();
        let diff = moment.duration(moment(then).diff(now));
        let ret = [];
        ['day', 'hour', 'minute', 'second'].forEach((denominator) => {
            if (diff.get(denominator) > 0)
                ret.push(util.format(
                    '%d%s',
                    diff.get(denominator),
                    denominator.charAt(0)
                ));
        })
        return ret.join(' ');
    }
}