"use strict";

module.exports = function(sequelize, DataTypes) {
    var Moderator = sequelize.define("Moderator", {
        guild: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });

    return Moderator;
}