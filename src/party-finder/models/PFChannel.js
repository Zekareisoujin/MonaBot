"use strict";

module.exports = function(sequelize, DataTypes) {
    var PFChannel = sequelize.define("PFChannel", {
        channel: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        partyChannel: {
            type: DataTypes.TEXT
        },
        timeOut: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        refreshPeriod: {
            type: DataTypes.INTEGER
        }
    });

    return PFChannel;
}