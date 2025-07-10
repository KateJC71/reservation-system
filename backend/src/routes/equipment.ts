import { Router, Request, Response } from 'express';
import { db } from '../database/init';

const router = Router();

// 獲取所有雪具
router.get('/', (req: Request, res: Response) => {
  const { category, size } = req.query;
  let query = 'SELECT * FROM equipment WHERE available_quantity > 0';
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (size) {
    query += ' AND size = ?';
    params.push(size);
  }

  query += ' ORDER BY name';

  db.all(query, params, (err, equipment) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    res.json(equipment);
  });
});

// 獲取單個雪具
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM equipment WHERE id = ?', [id], (err, equipment) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    if (!equipment) {
      return res.status(404).json({ message: '雪具不存在' });
    }
    res.json(equipment);
  });
});

// 獲取雪具類別
router.get('/categories/list', (req: Request, res: Response) => {
  db.all('SELECT DISTINCT category FROM equipment ORDER BY category', (err, categories) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    res.json(categories.map(cat => cat.category));
  });
});

// 獲取雪具尺寸
router.get('/sizes/list', (req: Request, res: Response) => {
  db.all('SELECT DISTINCT size FROM equipment ORDER BY size', (err, sizes) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    res.json(sizes.map(size => size.size));
  });
});

export default router; 