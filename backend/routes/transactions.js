const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');


router.use(authMiddleware);


router.get('/', async (req, res) => {
  try {
    const { search, category_id, type, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [req.userId];

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (startDate && endDate) {
      query += ' AND t.transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (search) {
      query += ' AND (t.description LIKE ? OR c.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

    const [transactions] = await db.query(query, params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (transactions.length === 0) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }
    res.json(transactions[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { category_id, amount, description, type, transaction_date } = req.body;
    
    if (!category_id || !amount || !type || !transaction_date) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

  
    const [categories] = await db.query('SELECT id FROM categories WHERE id = ? AND user_id = ?', [category_id, req.userId]);
    if (categories.length === 0) {
      return res.status(403).json({ error: 'Bu kategoriye erişim yetkiniz yok' });
    }

    const [result] = await db.query(
      'INSERT INTO transactions (user_id, category_id, amount, description, type, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, category_id, amount, description || null, type, transaction_date]
    );

    const [newTransaction] = await db.query(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(newTransaction[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { category_id, amount, description, type, transaction_date } = req.body;
    

    const [existing] = await db.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }


    if (category_id) {
      const [categories] = await db.query('SELECT id FROM categories WHERE id = ? AND user_id = ?', [category_id, req.userId]);
      if (categories.length === 0) {
        return res.status(403).json({ error: 'Bu kategoriye erişim yetkiniz yok' });
      }
    }
    
    await db.query(
      'UPDATE transactions SET category_id = ?, amount = ?, description = ?, type = ?, transaction_date = ? WHERE id = ? AND user_id = ?',
      [category_id, amount, description || null, type, transaction_date, req.params.id, req.userId]
    );

    const [updatedTransaction] = await db.query(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [req.params.id]);

    res.json(updatedTransaction[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }
    
    res.json({ message: 'İşlem başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const params = [req.userId];
    const params2 = [req.userId];
    
    if (startDate && endDate) {
      params.push(startDate, endDate);
      params2.push(startDate, endDate);
    }

    const [income] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND user_id = ? ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}`,
      params2
    );

    const [expense] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND user_id = ? ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}`,
      params2
    );

    
    let categoryQuery = `
      SELECT 
        c.name,
        c.color,
        c.type,
        COALESCE(SUM(t.amount), 0) as total
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ?
    `;
    const categoryParams = [req.userId];
    
    if (startDate && endDate) {
      categoryQuery += ' AND t.transaction_date BETWEEN ? AND ?';
      categoryParams.push(startDate, endDate);
    }
    
    categoryQuery += `
      WHERE c.user_id = ?
      GROUP BY c.id, c.name, c.color, c.type
      ORDER BY total DESC
    `;
    categoryParams.push(req.userId);
    
    const [categoryStats] = await db.query(categoryQuery, categoryParams);

    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ? ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}
      GROUP BY month, type
      ORDER BY month ASC
    `, params2);

    res.json({
      totalIncome: parseFloat(income[0].total),
      totalExpense: parseFloat(expense[0].total),
      balance: parseFloat(income[0].total) - parseFloat(expense[0].total),
      categoryStats,
      monthlyTrend
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

module.exports = router;


