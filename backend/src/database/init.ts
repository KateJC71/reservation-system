import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/snow_reservation.db');

// 確保資料目錄存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// 創建用戶表
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// 創建雪具表
const createEquipmentTable = `
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT CHECK(category IN ('ski', 'snowboard', 'boots', 'helmet', 'clothing')) NOT NULL,
  size TEXT NOT NULL,
  condition TEXT CHECK(condition IN ('excellent', 'good', 'fair', 'poor')) NOT NULL,
  daily_rate REAL NOT NULL,
  total_quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// 創建預約表
const createReservationsTable = `
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  equipment_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price REAL NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (equipment_id) REFERENCES equipment (id)
)`;

// 插入示例雪具數據
const insertSampleEquipment = `
INSERT OR IGNORE INTO equipment (name, category, size, condition, daily_rate, total_quantity, available_quantity, description) VALUES
('Salomon 滑雪板', 'ski', '170cm', 'excellent', 800, 10, 10, '專業級滑雪板，適合中高級滑雪者'),
('Burton 雪板', 'snowboard', '158cm', 'good', 600, 8, 8, '全山型雪板，適合各種地形'),
('Leki 滑雪杖', 'ski', '120cm', 'excellent', 100, 20, 20, '輕量化鋁合金滑雪杖'),
('Salomon 滑雪靴', 'boots', '42', 'good', 400, 15, 15, '舒適保暖的滑雪靴'),
('POC 安全帽', 'helmet', 'M', 'excellent', 200, 25, 25, '高安全性滑雪安全帽'),
('Columbia 滑雪外套', 'clothing', 'L', 'good', 300, 12, 12, '防水透氣的滑雪外套'),
('North Face 滑雪褲', 'clothing', '32', 'good', 250, 15, 15, '保暖防水的滑雪褲'),
('Atomic 兒童滑雪板', 'ski', '120cm', 'excellent', 500, 5, 5, '適合兒童的輕量化滑雪板')
`;

async function initDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // 創建表
      db.run(createUsersTable, (err) => {
        if (err) {
          console.error('創建用戶表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 用戶表創建成功');
      });

      db.run(createEquipmentTable, (err) => {
        if (err) {
          console.error('創建雪具表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 雪具表創建成功');
      });

      db.run(createReservationsTable, (err) => {
        if (err) {
          console.error('創建預約表失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 預約表創建成功');
      });

      // 插入示例數據
      db.run(insertSampleEquipment, (err) => {
        if (err) {
          console.error('插入示例數據失敗:', err);
          reject(err);
          return;
        }
        console.log('✅ 示例雪具數據插入成功');
        resolve();
      });
    });
  });
}

// 如果直接執行此文件
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 資料庫初始化完成！');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ 資料庫初始化失敗:', err);
      process.exit(1);
    });
}

export { db, initDatabase }; 