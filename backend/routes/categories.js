const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');


router.use(authMiddleware);


router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM categories WHERE user_id = ?';
    const params = [req.userId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY type, name';
    
    const [categories] = await db.query(query, params);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    res.json(categories[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { name, type, color } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Kategori adı ve tipi gereklidir' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
      [req.userId, name, type, color || '#3B82F6']
    );

    const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(newCategory[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { name, type, color } = req.body;
    
    const [result] = await db.query(
      'UPDATE categories SET name = ?, type = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, type, color || '#3B82F6', req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    const [updatedCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(updatedCategory[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


