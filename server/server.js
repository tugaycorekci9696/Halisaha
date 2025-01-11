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
        oyuncu_sabit_guc INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Oyuncu özellikleri ana tablosunu oluştur
    await db.query(`
      CREATE TABLE IF NOT EXISTS ozellikler (
        id INT AUTO_INCREMENT PRIMARY KEY,
        isim VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Oyuncu yetenekleri tablosunu sil ve yeniden oluştur
    await db.query('DROP TABLE IF EXISTS oyuncu_ozellikleri');
    
    await db.query(`
      CREATE TABLE oyuncu_ozellikleri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        oyuncu_id INT NOT NULL,
        isim VARCHAR(50) NOT NULL,
        deger INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL,
        FOREIGN KEY (oyuncu_id) REFERENCES oyuncular(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Mevcut özellikleri temizle
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE ozellikler');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // Varsayılan özellikleri ekle
    const varsayilanOzellikler = [
      'Bitiricilik',
      'Dripling',
      'İlk Kontrol',
      'Kafa Vuruşu',
      'Korner',
      'Markaj',
      'Orta Yapma',
      'Pas',
      'Penaltı Kullanma',
      'Serbest Vuruş Kullanma',
      'Teknik',
      'Top Kapma',
      'Uzaktan Şut',
      'Uzun Taç',
      'Agresiflik',
      'Cesaret',
      'Çalışkanlık',
      'Karar Alma',
      'Kararlılık',
      'Konsantrasyon',
      'Liderlik',
      'Önsezi',
      'Özel Yetenek',
      'Pozisyon Alma',
      'Soğukkanlılık',
      'Takım Oyunu',
      'Topsuz Alan',
      'Vizyon',
      'Çeviklik',
      'Dayanıklılık',
      'Denge',
      'Güç',
      'Hız',
      'Hızlanma',
      'Vücut Zindeliği',
      'Zıplama'
    ];

    // Her özelliği tekil olarak ekle
    for (const ozellik of varsayilanOzellikler) {
      await db.query(
        'INSERT INTO ozellikler (isim) VALUES (?)',
        [ozellik]
      );
    }

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
    
    // Her oyuncu için özellikleri, pozisyonları ve grupları getir
    for (const oyuncu of oyuncular) {
      const [ozellikler] = await db.query(
        'SELECT isim, deger FROM oyuncu_ozellikleri WHERE oyuncu_id = ?',
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
    const { adSoyad, resim, yetenekler, guc, pozisyonlar, gruplar } = req.body;
    
    // Önce oyuncuyu ekle (varsayılan güç değeri 50 ile)
    const [result] = await db.query(
      'INSERT INTO oyuncular (adSoyad, resim, guc) VALUES (?, ?, ?)',
      [adSoyad, resim, 50]
    );
    
    const oyuncuId = result.insertId;

    // Tüm özellikleri getir ve her biri için varsayılan değer olarak 10 ata
    const [ozellikler] = await db.query('SELECT id FROM ozellikler');
    
    // Varsayılan güç hesaplama (10 * özellik sayısı * 5 / özellik sayısı = 50)
    for (const ozellik of ozellikler) {
      await db.query(
        'INSERT INTO oyuncu_yetenekleri (oyuncu_id, ozellik_id, seviye) VALUES (?, ?, ?)',
        [oyuncuId, ozellik.id, 10]
      );
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

    // Grupları ekle
    if (gruplar && gruplar.length > 0) {
      for (const grupId of gruplar) {
        await db.query(
          'INSERT INTO oyuncu_gruplar (oyuncu_id, grup_id) VALUES (?, ?)',
          [oyuncuId, grupId]
        );
      }
    }
    
    // Oluşturulan oyuncuyu tüm bilgileriyle birlikte getir
    const [[yeniOyuncu]] = await db.query('SELECT * FROM oyuncular WHERE id = ?', [oyuncuId]);
    
    // Oyuncunun gruplarını getir
    const [oyuncuGruplari] = await db.query(`
      SELECT g.*, (
        SELECT COUNT(*) 
        FROM oyuncu_gruplar og2 
        WHERE og2.grup_id = g.id
      ) as oyuncuSayisi
      FROM gruplar g
      INNER JOIN oyuncu_gruplar og ON g.id = og.grup_id
      WHERE og.oyuncu_id = ?
    `, [oyuncuId]);

    // Oyuncunun pozisyonlarını getir
    const [oyuncuPozisyonlari] = await db.query(
      'SELECT pozisyon_kodu, seviye FROM pozisyonlar WHERE oyuncu_id = ?',
      [oyuncuId]
    );

    // Pozisyonları obje formatına dönüştür
    const pozisyonSeviyeleri = {};
    oyuncuPozisyonlari.forEach(poz => {
      pozisyonSeviyeleri[poz.pozisyon_kodu] = poz.seviye;
    });

    yeniOyuncu.gruplar = oyuncuGruplari;
    yeniOyuncu.pozisyonlar = pozisyonSeviyeleri;
    
    res.json(yeniOyuncu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncu güncelle
app.put('/api/oyuncular/:id', async (req, res) => {
  try {
    const { adSoyad, resim, yetenekler, guc, oyuncu_sabit_guc, pozisyonlar } = req.body;
    const oyuncuId = req.params.id;
    
    // Güncelleme sorgusunu oluştur
    let updateFields = [];
    let updateValues = [];
    
    if (adSoyad !== undefined) {
      updateFields.push('adSoyad = ?');
      updateValues.push(adSoyad);
    }
    if (resim !== undefined) {
      updateFields.push('resim = ?');
      updateValues.push(resim);
    }
    if (guc !== undefined) {
      updateFields.push('guc = ?');
      updateValues.push(guc);
    }
    if (oyuncu_sabit_guc !== undefined) {
      updateFields.push('oyuncu_sabit_guc = ?');
      updateValues.push(oyuncu_sabit_guc);
    }
    
    // updated_at alanını her zaman güncelle
    updateFields.push('updated_at = NOW()');
    
    // Oyuncuyu güncelle
    if (updateFields.length > 0) {
      await db.query(
        `UPDATE oyuncular SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, oyuncuId]
      );
    }
    
    // Yetenekleri güncelle (eğer gönderilmişse)
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

    // Pozisyonları güncelle (eğer gönderilmişse)
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

    // Güncellenmiş oyuncuyu getir
    const [[oyuncu]] = await db.query('SELECT * FROM oyuncular WHERE id = ?', [oyuncuId]);
    
    res.json(oyuncu);
  } catch (error) {
    console.error('Oyuncu güncellenirken hata:', error);
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

// Oyuncu özelliklerini getir
app.get('/api/oyuncu-ozellikleri', async (req, res) => {
  try {
    const [ozellikler] = await db.query('SELECT * FROM ozellikler ORDER BY id');
    res.json(ozellikler);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncunun yeteneklerini getir
app.get('/api/oyuncular/:id/yetenekler', async (req, res) => {
  try {
    const oyuncuId = req.params.id;
    const [yetenekler] = await db.query(`
      SELECT o.id as ozellik_id, COALESCE(oo.deger, 10) as seviye
      FROM ozellikler o
      LEFT JOIN oyuncu_ozellikleri oo ON o.isim = oo.isim AND oo.oyuncu_id = ?
      ORDER BY o.id
    `, [oyuncuId]);
    
    res.json(yetenekler);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncunun yeteneklerini güncelle
app.put('/api/oyuncular/:id/yetenekler', async (req, res) => {
  try {
    const oyuncuId = req.params.id;
    const { yetenekler } = req.body;

    // Yetenekler kontrolü
    if (!yetenekler || !Array.isArray(yetenekler)) {
      return res.status(400).json({ error: 'Yetenekler bir dizi olarak gönderilmelidir' });
    }

    // Önce mevcut yetenekleri sil
    await db.query('DELETE FROM oyuncu_ozellikleri WHERE oyuncu_id = ?', [oyuncuId]);

    // Yeni yetenekleri ekle
    for (const yetenek of yetenekler) {
      if (!yetenek.ozellik_id) {
        continue; // Geçersiz yetenek verilerini atla
      }

      // Özellik adını al
      const [[ozellik]] = await db.query('SELECT isim FROM ozellikler WHERE id = ?', [yetenek.ozellik_id]);
      if (!ozellik) continue;
      
      await db.query(`
        INSERT INTO oyuncu_ozellikleri (oyuncu_id, isim, deger)
        VALUES (?, ?, ?)
      `, [oyuncuId, ozellik.isim, yetenek.seviye]);
    }

    res.json({ message: 'Yetenekler güncellendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
}); 
