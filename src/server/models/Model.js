const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Model = sequelize.define('Model', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  api: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Model.associate = function(models) {
  Model.hasMany(models.Agent, {
    foreignKey: 'model_id'
  });
};

module.exports = Model;