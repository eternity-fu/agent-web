const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Agent = sequelize.define('Agent', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  model_id: {
    type: DataTypes.INTEGER, // 关联的 Model ID
    allowNull: true,
  },
});

Agent.associate = function(models) {
  Agent.belongsTo(models.Model, {
    foreignKey: 'model_id'
  });
  Agent.belongsToMany(models.Tool, {
    through: 'agent_tool',
    foreignKey: 'agent_id',
    otherKey: 'tool_id'
  });
};

module.exports = Agent;