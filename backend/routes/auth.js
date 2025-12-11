const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');


router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }


    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Bu email zaten kullanılıyor' });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

 
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const [existingCategories] = await db.query(
      'SELECT COUNT(*) as count FROM categories WHERE user_id = ?',
      [result.insertId]
    );
    if (existingCategories[0].count === 0) {
      const defaultCategories = [
        ['Maaş', 'income', '#10B981'],
        ['Yatırım', 'income', '#10B981'],
        ['Diğer Gelir', 'income', '#10B981'],
        ['Yemek', 'expense', '#EF4444'],
        ['Ulaşım', 'expense', '#F59E0B'],
        ['Faturalar', 'expense', '#3B82F6'],
        ['Alışveriş', 'expense', '#6366F1'],
        ['Diğer Gider', 'expense', '#6B7280'],
        ['Satış', 'income', '#497534ff']
      ];

      try {
        for (const [categoryName, type, color] of defaultCategories) {
          try {
            // Aynı isimde kategori var mı kontrol et
            const [existing] = await db.query(
              'SELECT id FROM categories WHERE user_id = ? AND name = ?',
              [result.insertId, categoryName]
            );

            // Eğer yoksa ekle
            if (existing.length === 0) {
              await db.query(
                'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
                [result.insertId, categoryName, type, color]
              );
            }
          } catch (categoryError) {
            console.error(`Kategori eklenirken hata (${categoryName}):`, categoryError);
          }
        }
      } catch (categoryError) {
        console.error('Kategoriler eklenirken genel hata:', categoryError);
      }
    }
   
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gereklidir' });
    }

    
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const user = users[0];

 
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
});


router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    
    const [users] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

module.exports = router;


