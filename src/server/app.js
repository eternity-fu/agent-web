const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const agentRoutes = require('./routes/agents');
const toolRoutes = require('./routes/tools');
const modelRoutes = require('./routes/models');

const app = express();

// 导入所有模型
const Agent = require('./models/Agent');
const Tool = require('./models/Tool');
const Model = require('./models/Model');
const AgentTool = require('./models/agent_tool');

// 初始化关联
Object.values(sequelize.models).forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// 中间件
app.use(cors()); // 解决跨域
app.use(express.json()); // 解析 JSON 请求体

// 路由
app.use('/api/agents', agentRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/models', modelRoutes);

// 同步数据库
sequelize.sync({ force: false })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync failed:', err));

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});