// models/Machine.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Machine = sequelize.define('Machine', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'in-use', 'maintenance'),
    defaultValue:   'available'
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = Machine;
