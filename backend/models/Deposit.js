const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Deposit = sequelize.define('Deposit', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'deposits',
    timestamps: false
});

module.exports = Deposit;
