const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Tool = require('../models/Tool')
const Model = require('../models/Model')

// 获取所有 Agents（包含关联的 Model 和 Tools）
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.findAll({
      include: [
        { model: Model, as: 'Model' }, // 关联 Model
        { model: Tool, as: 'Tools' },  // 关联 Tools
      ],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建或更新 Agent（包含关联 Tools）
router.post('/', async (req, res) => {
  try {
    const { id, agent_name, agent_description, agent_model_id, tools } = req.body;
    let agent;

    if (id) {
      // 更新 Agent
      agent = await Agent.findByPk(id);
      await agent.update({ agent_name, agent_description, agent_model_id });
      // 更新关联的 Tools
      if (tools) {
        const toolInstances = await Tool.findAll({ where: { id: tools } });
        await agent.setTools(toolInstances);
      }
    } else {
      // 创建 Agent
      agent = await Agent.create({ agent_name, agent_description, agent_model_id });
      if (tools) {
        const toolInstances = await Tool.findAll({ where: { id: tools } });
        await agent.addTools(toolInstances);
      }
    }

    // 返回包含关联数据的 Agent
    const result = await Agent.findByPk(agent.id, {
      include: [Tool], // 包含关联的 Tools
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除 Agent
router.delete('/:id', async (req, res) => {
  try {
    await Agent.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;