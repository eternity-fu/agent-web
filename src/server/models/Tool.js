const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tool = sequelize.define('Tool', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Tool.associate = function (models) {
  Tool.belongsToMany(models.Agent, {
    through: 'agent_tool',
    foreignKey: 'tool_id',
    otherKey: 'agent_id'
  });
};

module.exports = Tool;