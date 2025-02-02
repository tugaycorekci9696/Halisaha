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

    // Gruplar tablosunu oluştur (eğer yoksa)
    await db.query(`
      CREATE TABLE IF NOT EXISTS gruplar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        isim VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Oyuncu-Grup ilişki tablosunu oluştur (eğer yoksa)
    await db.query(`
      CREATE TABLE IF NOT EXISTS oyuncu_gruplar (
        oyuncu_id INT NOT NULL,
        grup_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (oyuncu_id, grup_id),
        FOREIGN KEY (oyuncu_id) REFERENCES oyuncular(id) ON DELETE CASCADE,
        FOREIGN KEY (grup_id) REFERENCES gruplar(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('Veritabanı şeması kontrol edildi');
  } catch (error) {
    console.error('Veritabanı şeması kontrol edilirken hata:', error);
    process.exit(1);
  }
};

// Uygulama başladığında veritabanını hazırla
initDatabase();

// Tüm oyuncuları getir
app.get('/api/oyuncular', async (req, res) => {
  try {
    const [oyuncular] = await db.query('SELECT * FROM oyuncular');
    
    // Her oyuncu için özellikleri, pozisyonları ve grupları getir
    for (const oyuncu of oyuncular) {
      const [ozellikler] = await db.query(
        'SELECT ozellik_adi, deger FROM oyuncu_ozellikleri WHERE oyuncu_id = ?',
        [oyuncu.id]
      );
      
      const [pozisyonlar] = await db.query(
        'SELECT pozisyon_kodu, seviye FROM pozisyonlar WHERE oyuncu_id = ?',
        [oyuncu.id]
      );

      const [gruplar] = await db.query(`
        SELECT g.*, (
          SELECT COUNT(*) 
          FROM oyuncu_gruplar og2 
          WHERE og2.grup_id = g.id
        ) as oyuncuSayisi
        FROM gruplar g
        INNER JOIN oyuncu_gruplar og ON g.id = og.grup_id
        WHERE og.oyuncu_id = ?
      `, [oyuncu.id]);
      
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
      oyuncu.gruplar = gruplar;
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

// Formasyon ekle
app.post('/api/formasyonlar', async (req, res) => {
  try {
    const { isim, pozisyonlar } = req.body
    
    const [result] = await db.query(
      'INSERT INTO formasyonlar (isim, pozisyonlar) VALUES (?, ?)',
      [isim, JSON.stringify(pozisyonlar)]
    )
    
    res.json({ id: result.insertId, isim, pozisyonlar })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Sunucu hatası' })
  }
})

// Formasyonları getir
app.get('/api/formasyonlar', async (req, res) => {
  try {
    const [formasyonlar] = await db.query('SELECT * FROM formasyonlar')
    
    // pozisyonlar JSON string'ini parse et
    const formasyonlarParsed = formasyonlar.map(f => ({
      ...f,
      pozisyonlar: JSON.parse(f.pozisyonlar)
    }))
    
    res.json(formasyonlarParsed)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Sunucu hatası' })
  }
})

// Pozisyonları getir
app.get('/api/pozisyonlar', (req, res) => {
  const pozisyonlar = [
    { kod: 'GK', isim: 'Kaleci' },
    { kod: 'DL', isim: 'Sol Defans' },
    { kod: 'DC', isim: 'Stoper' },
    { kod: 'DR', isim: 'Sağ Defans' },
    { kod: 'DM', isim: 'Defansif Orta Saha' },
    { kod: 'CM', isim: 'Orta Saha' },
    { kod: 'OOS', isim: 'Ofansif Orta Saha' },
    { kod: 'LW', isim: 'Sol Kanat' },
    { kod: 'ST', isim: 'Forvet' },
    { kod: 'RW', isim: 'Sağ Kanat' }
  ]
  res.json(pozisyonlar)
})

// Grupları getir
app.get('/api/gruplar', async (req, res) => {
  try {
    const [gruplar] = await db.query(`
      SELECT g.*, (
        SELECT COUNT(*) 
        FROM oyuncu_gruplar og 
        WHERE og.grup_id = g.id
      ) as oyuncuSayisi
      FROM gruplar g
    `);
    res.json(gruplar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni grup ekle
app.post('/api/gruplar', async (req, res) => {
  try {
    const { isim } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO gruplar (isim) VALUES (?)',
      [isim]
    );
    
    res.json({
      id: result.insertId,
      isim,
      oyuncuSayisi: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Grup güncelle
app.put('/api/gruplar/:id', async (req, res) => {
  try {
    const { isim } = req.body;
    const grupId = req.params.id;
    
    await db.query(
      'UPDATE gruplar SET isim = ?, updated_at = NOW() WHERE id = ?',
      [isim, grupId]
    );
    
    const [[grup]] = await db.query(`
      SELECT g.*, (
        SELECT COUNT(*) 
        FROM oyuncu_gruplar og 
        WHERE og.grup_id = g.id
      ) as oyuncuSayisi
      FROM gruplar g
      WHERE g.id = ?
    `, [grupId]);
    
    res.json(grup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Grup sil
app.delete('/api/gruplar/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM gruplar WHERE id = ?', [req.params.id]);
    res.json({ message: 'Grup başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncunun gruplarını güncelle
app.put('/api/oyuncular/:id/gruplar', async (req, res) => {
  try {
    const { grupIds } = req.body;
    const oyuncuId = req.params.id;

    // Önce mevcut grupları sil
    await db.query('DELETE FROM oyuncu_gruplar WHERE oyuncu_id = ?', [oyuncuId]);

    // Yeni grupları ekle
    if (grupIds && grupIds.length > 0) {
      const values = grupIds.map(grupId => [oyuncuId, grupId]);
      await db.query(
        'INSERT INTO oyuncu_gruplar (oyuncu_id, grup_id) VALUES ?',
        [values]
      );
    }

    res.json({ message: 'Oyuncu grupları güncellendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
}); 
