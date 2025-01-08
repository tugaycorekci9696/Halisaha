import cors from 'cors';
import express from 'express';
import db from './db.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Veritabanı şemasını oluştur
const initDatabase = async () => {
  try {
    // Önce mevcut tabloları sil (geçici çözüm)
    await db.query('DROP TABLE IF EXISTS pozisyonlar');
    await db.query('DROP TABLE IF EXISTS oyuncu_ozellikleri');
    await db.query('DROP TABLE IF EXISTS oyuncular');
    
    // Oyuncular tablosunu oluştur (eğer yoksa)
    await db.query(`
      CREATE TABLE IF NOT EXISTS oyuncular (
        id INT AUTO_INCREMENT PRIMARY KEY,
        adSoyad VARCHAR(100) NOT NULL,
        resim LONGTEXT,
        guc INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Oyuncu özellikleri tablosunu oluştur (eğer yoksa)
    await db.query(`
      CREATE TABLE IF NOT EXISTS oyuncu_ozellikleri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        oyuncu_id INT NOT NULL,
        ozellik_adi VARCHAR(50) NOT NULL,
        deger INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL,
        FOREIGN KEY (oyuncu_id) REFERENCES oyuncular(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Pozisyonlar tablosunu oluştur (eğer yoksa)
    await db.query(`
      CREATE TABLE IF NOT EXISTS pozisyonlar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        oyuncu_id INT NOT NULL,
        pozisyon_kodu VARCHAR(10) NOT NULL,
        seviye INT NOT NULL COMMENT '1: Çok Kötü, 2: Kötü, 3: Ortalama, 4: İyi, 5: Çok İyi',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL,
        FOREIGN KEY (oyuncu_id) REFERENCES oyuncular(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('Veritabanı şeması yeniden oluşturuldu');
  } catch (error) {
    console.error('Veritabanı şeması oluşturulurken hata:', error);
    process.exit(1);
  }
};

// Uygulama başladığında veritabanını hazırla
initDatabase();

// Tüm oyuncuları getir
app.get('/api/oyuncular', async (req, res) => {
  try {
    const [oyuncular] = await db.query('SELECT * FROM oyuncular');
    
    // Her oyuncu için özellikleri ve pozisyonları getir
    for (const oyuncu of oyuncular) {
      const [ozellikler] = await db.query(
        'SELECT ozellik_adi, deger FROM oyuncu_ozellikleri WHERE oyuncu_id = ?',
        [oyuncu.id]
      );
      
      const [pozisyonlar] = await db.query(
        'SELECT pozisyon_kodu, seviye FROM pozisyonlar WHERE oyuncu_id = ?',
        [oyuncu.id]
      );
      
      // Özellikleri obje formatına dönüştür
      const yetenekler = {};
      ozellikler.forEach(ozellik => {
        yetenekler[ozellik.ozellik_adi] = ozellik.deger;
      });
      
      // Pozisyonları obje formatına dönüştür
      const pozisyonSeviyeleri = {};
      pozisyonlar.forEach(poz => {
        pozisyonSeviyeleri[poz.pozisyon_kodu] = poz.seviye;
      });
      
      oyuncu.yetenekler = yetenekler;
      oyuncu.pozisyonlar = pozisyonSeviyeleri;
    }
    
    res.json(oyuncular);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni oyuncu ekle
app.post('/api/oyuncular', async (req, res) => {
  try {
    const { adSoyad, resim, yetenekler, guc, pozisyonlar } = req.body;
    
    // Önce oyuncuyu ekle
    const [result] = await db.query(
      'INSERT INTO oyuncular (adSoyad, resim, guc) VALUES (?, ?, ?)',
      [adSoyad, resim, guc]
    );
    
    const oyuncuId = result.insertId;
    
    // Sonra özellikleri ekle
    if (yetenekler) {
      for (const [ozellikAdi, deger] of Object.entries(yetenekler)) {
        await db.query(
          'INSERT INTO oyuncu_ozellikleri (oyuncu_id, ozellik_adi, deger) VALUES (?, ?, ?)',
          [oyuncuId, ozellikAdi, deger]
        );
      }
    }

    // Pozisyonları ekle
    if (pozisyonlar) {
      for (const [pozisyonKodu, seviye] of Object.entries(pozisyonlar)) {
        if (seviye > 0) { // Sadece seçili pozisyonları kaydet
          await db.query(
            'INSERT INTO pozisyonlar (oyuncu_id, pozisyon_kodu, seviye) VALUES (?, ?, ?)',
            [oyuncuId, pozisyonKodu, seviye]
          );
        }
      }
    }
    
    res.json({ id: oyuncuId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncu güncelle
app.put('/api/oyuncular/:id', async (req, res) => {
  try {
    const { adSoyad, resim, yetenekler, guc, pozisyonlar } = req.body;
    const oyuncuId = req.params.id;
    
    // Önce oyuncuyu güncelle
    await db.query(
      'UPDATE oyuncular SET adSoyad = ?, resim = ?, guc = ?, updated_at = NOW() WHERE id = ?',
      [adSoyad, resim, guc, oyuncuId]
    );
    
    // Sonra özellikleri güncelle
    if (yetenekler) {
      // Önce mevcut özellikleri sil
      await db.query('DELETE FROM oyuncu_ozellikleri WHERE oyuncu_id = ?', [oyuncuId]);
      
      // Yeni özellikleri ekle
      for (const [ozellikAdi, deger] of Object.entries(yetenekler)) {
        await db.query(
          'INSERT INTO oyuncu_ozellikleri (oyuncu_id, ozellik_adi, deger) VALUES (?, ?, ?)',
          [oyuncuId, ozellikAdi, deger]
        );
      }
    }

    // Pozisyonları güncelle
    if (pozisyonlar) {
      // Önce mevcut pozisyonları sil
      await db.query('DELETE FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);
      
      // Yeni pozisyonları ekle
      for (const [pozisyonKodu, seviye] of Object.entries(pozisyonlar)) {
        if (seviye > 0) { // Sadece seçili pozisyonları kaydet
          await db.query(
            'INSERT INTO pozisyonlar (oyuncu_id, pozisyon_kodu, seviye) VALUES (?, ?, ?)',
            [oyuncuId, pozisyonKodu, seviye]
          );
        }
      }
    }
    
    res.json({ id: oyuncuId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncu sil
app.delete('/api/oyuncular/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM oyuncular WHERE id = ?', [req.params.id]);
    res.json({ message: 'Oyuncu başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
}); 
