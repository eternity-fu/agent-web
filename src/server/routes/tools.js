const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');

// 获取所有 Tool
router.get('/', async (req, res) => {
  try {
    const tools = await Tool.findAll();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建或更新 Tool
router.post('/', async (req, res) => {
  try {
    const { id, name, description, code } = req.body;
    if (id) {
      await Tool.update({ name, description, code }, { where: { id } });
      const updatedTool = await Tool.findByPk(id);
      res.json(updatedTool);
    } else {
      const newTool = await Tool.create({ name, description, code });
      res.json(newTool);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除 Tool
router.delete('/:id', async (req, res) => {
  try {
    await Tool.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;