const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('netzone', 'root', 'susu14042005', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
