
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users', // Liên kết với bảng 'Users'
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        machine_id: {  // Trường này để liên kết với máy
            type: DataTypes.INTEGER,
            references: {
                model: 'Machines',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'in-progress',
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
    });

    // Quan hệ giữa các bảng
    Session.associate = function (models) {
        // Liên kết Session với User
        Session.belongsTo(models.User, { foreignKey: 'user_id' });
        // Liên kết Session với Machine
        Session.belongsTo(models.Machine, { foreignKey: 'machine_id' });
    };

    return Session;
};
