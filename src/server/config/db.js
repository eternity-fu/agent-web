const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('data_analysis', 'root', 'Fxc234513@', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // 关闭 SQL 日志
});

module.exports = sequelize;