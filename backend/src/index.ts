import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './database/init';

// 路由
import authRoutes from './routes/auth';
import equipmentRoutes from './routes/equipment';
import reservationRoutes from './routes/reservations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reservations', reservationRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '雪具預約系統 API 運行正常',
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理中間件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '伺服器內部錯誤' });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ message: '路由不存在' });
});

// 啟動伺服器
async function startServer() {
  try {
    // 初始化資料庫
    await initDatabase();
    console.log('✅ 資料庫初始化完成');

    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📊 API 文檔: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
}

startServer(); 