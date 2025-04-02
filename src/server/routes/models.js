const express = require('express');
const router = express.Router();
const Model = require('../models/Model');

// 获取所有 Model
router.get('/', async (req, res) => {
  try {
    const models = await Model.findAll();
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建或更新 Agent
router.post('/', async (req, res) => {
  try {
    const { id, name, description, api, url } = req.body;
    if (id) {
      await Model.update({ name, description,api, url }, { where: { id } });
      const updatedModel = await Model.findByPk(id);
      res.json(updatedModel);
    } else {
      const newModel = await Model.create({ name, description, api, url });
      res.json(newModel);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除 Agent
router.delete('/:id', async (req, res) => {
  try {
    await Model.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;