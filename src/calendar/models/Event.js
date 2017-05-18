"use strict";

module.exports = function(sequelize, DataTypes) {
    var Event = sequelize.define("Event", {
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false
        },
        guild: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: DataTypes.DATE
    });

    return Event;
}