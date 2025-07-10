import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// 創建預約
router.post('/', authenticateToken, [
  body('equipment_id').isInt().withMessage('雪具ID必須是整數'),
  body('start_date').isDate().withMessage('開始日期格式無效'),
  body('end_date').isDate().withMessage('結束日期格式無效')
], (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { equipment_id, start_date, end_date, notes } = req.body;
  const user_id = req.user!.id;

  // 檢查日期是否有效
  const start = new Date(start_date);
  const end = new Date(end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return res.status(400).json({ message: '開始日期不能早於今天' });
  }

  if (end <= start) {
    return res.status(400).json({ message: '結束日期必須晚於開始日期' });
  }

  // 檢查雪具是否可用
  db.get('SELECT * FROM equipment WHERE id = ?', [equipment_id], (err, equipment) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    if (!equipment) {
      return res.status(404).json({ message: '雪具不存在' });
    }
    if (equipment.available_quantity <= 0) {
      return res.status(400).json({ message: '雪具庫存不足' });
    }

    // 檢查日期衝突
    const checkConflict = `
      SELECT COUNT(*) as count FROM reservations 
      WHERE equipment_id = ? AND status != 'cancelled'
      AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))
    `;
    
    db.get(checkConflict, [equipment_id, start_date, start_date, end_date, end_date, start_date, end_date], (err, result) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }
      if (result.count > 0) {
        return res.status(400).json({ message: '該日期範圍內雪具已被預約' });
      }

      // 計算總價
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const total_price = equipment.daily_rate * days;

      // 創建預約
      const insertReservation = `
        INSERT INTO reservations (user_id, equipment_id, start_date, end_date, total_price, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(insertReservation, [user_id, equipment_id, start_date, end_date, total_price, notes], function(err) {
        if (err) {
          return res.status(500).json({ message: '創建預約失敗' });
        }

        // 更新雪具可用數量
        db.run('UPDATE equipment SET available_quantity = available_quantity - 1 WHERE id = ?', [equipment_id]);

        res.status(201).json({
          message: '預約創建成功',
          reservation_id: this.lastID,
          total_price
        });
      });
    });
  });
});

// 獲取用戶預約
router.get('/my', authenticateToken, (req: AuthRequest, res: Response) => {
  const user_id = req.user!.id;
  
  const query = `
    SELECT r.*, e.name as equipment_name, e.category, e.size, e.image_url
    FROM reservations r
    JOIN equipment e ON r.equipment_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;
  
  db.all(query, [user_id], (err, reservations) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    res.json(reservations);
  });
});

// 取消預約
router.patch('/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user_id = req.user!.id;

  // 檢查預約是否存在且屬於該用戶
  db.get('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [id, user_id], (err, reservation) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    if (!reservation) {
      return res.status(404).json({ message: '預約不存在' });
    }
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: '預約已被取消' });
    }
    if (reservation.status === 'completed') {
      return res.status(400).json({ message: '已完成的預約無法取消' });
    }

    // 取消預約
    db.run('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', id], function(err) {
      if (err) {
        return res.status(500).json({ message: '取消預約失敗' });
      }

      // 恢復雪具可用數量
      db.run('UPDATE equipment SET available_quantity = available_quantity + 1 WHERE id = ?', [reservation.equipment_id]);

      res.json({ message: '預約取消成功' });
    });
  });
});

export default router; 