const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AgentTool = sequelize.define('agent_tool', {
  agent_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Agent', key: 'id' },
    onDelete: 'CASCADE',
  },
  tool_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Tool', key: 'id' },
    onDelete: 'CASCADE',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = AgentTool;