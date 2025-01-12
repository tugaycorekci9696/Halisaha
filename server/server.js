import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import db from './db.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Resim yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/profil');
    console.log('Upload directory:', uploadDir);
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Upload directory created successfully');
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'profil-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Sadece resim dosyaları yüklenebilir (jpeg, jpg, png)'));
  }
});

// Veritabanını başlat
const initializeDatabase = async () => {
  try {
    // Resim kolonunu güncelle
    await db.query(`
      ALTER TABLE oyuncular 
      MODIFY COLUMN resim LONGTEXT,
      MODIFY COLUMN updated_at DATETIME
    `);

    // Güç kolonunu ekle (eğer yoksa)
    try {
      await db.query(`
        ALTER TABLE oyuncular 
        ADD COLUMN guc FLOAT DEFAULT 0
      `);
      console.log('Güç kolonu eklendi');
    } catch (error) {
      // Kolon zaten varsa hata vermesini engelle
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    console.log('Veritabanı başarıyla güncellendi');
  } catch (error) {
    console.error('Veritabanı güncellenirken hata:', error);
  }
};

// Veritabanını başlat
initializeDatabase();

// Tüm oyuncuları getir
app.get('/api/oyuncular', async (req, res) => {
  try {
    // Önce güç hesaplama sorgusunu al
    const [[gucQuery]] = await db.query('SELECT q_query FROM queryler WHERE q_id = 1');
    
    if (!gucQuery || !gucQuery.q_query) {
      throw new Error('Güç hesaplama sorgusu bulunamadı');
    }

    // Oyuncuları getir ve güç değerlerini hesapla
    const [oyuncular] = await db.query(`
      SELECT 
        o.id, 
        o.adSoyad,
        o.resim,
        o.created_at,
        o.updated_at,
        o.guc
      FROM oyuncular o
      ORDER BY o.id DESC
    `);

    // Her oyuncu için pozisyonları ve grupları getir
    for (let oyuncu of oyuncular) {
      // Pozisyonları getir
      const [pozisyonlar] = await db.query(
        'SELECT ST, OOS, RW, LW, CM, DM, DC, DR, DL, GK FROM pozisyonlar WHERE oyuncu_id = ?',
        [oyuncu.id]
      );

      // Pozisyonları ayrı bir nesne olarak ekle
      oyuncu.pozisyonlar = pozisyonlar[0] || {
        ST: 1, OOS: 1, RW: 1, LW: 1, CM: 1, 
        DM: 1, DC: 1, DR: 1, DL: 1, GK: 1
      };

      // Grupları getir
      const [gruplar] = await db.query(`
        SELECT g.id, g.isim
        FROM gruplar g
        INNER JOIN oyuncu_gruplar og ON g.id = og.grup_id
        WHERE og.oyuncu_id = ?
      `, [oyuncu.id]);
      
      oyuncu.gruplar = gruplar || [];
    }
    
    res.json(oyuncular);
  } catch (error) {
    console.error('Oyuncular getirilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek oyuncu getir
app.get('/api/oyuncular/:id', async (req, res) => {
  try {
    const oyuncuId = parseInt(req.params.id);
    
    // Oyuncuyu getir
    const [oyuncular] = await db.query(`
      SELECT 
        o.id, 
        o.adSoyad,
        o.resim,
        o.created_at,
        o.updated_at
      FROM oyuncular o
      WHERE o.id = ?
    `, [oyuncuId]);

    if (oyuncular.length === 0) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    const oyuncu = oyuncular[0];

    // Pozisyonları getir
    const [pozisyonlar] = await db.query(
      'SELECT ST, OOS, RW, LW, CM, DM, DC, DR, DL, GK FROM pozisyonlar WHERE oyuncu_id = ?',
      [oyuncu.id]
    );

    // Pozisyonları ayrı bir nesne olarak ekle
    oyuncu.pozisyonlar = pozisyonlar[0] || {
      ST: 1, OOS: 1, RW: 1, LW: 1, CM: 1, 
      DM: 1, DC: 1, DR: 1, DL: 1, GK: 1
    };

    // Grupları getir
    const [gruplar] = await db.query(`
      SELECT g.id, g.isim
      FROM gruplar g
      INNER JOIN oyuncu_gruplar og ON g.id = og.grup_id
      WHERE og.oyuncu_id = ?
    `, [oyuncu.id]);

    oyuncu.gruplar = gruplar || [];

    res.json(oyuncu);
  } catch (error) {
    console.error('Oyuncu getirilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncu ekle
app.post('/api/oyuncular', async (req, res) => {
  try {
    const { adSoyad, resim, gruplar, pozisyonlar } = req.body;
    console.log('Gelen veriler:');
    console.log('- Ad Soyad:', adSoyad);
    console.log('- Resim var mı?:', resim ? 'Evet' : 'Hayır');
    console.log('- Resim uzunluğu:', resim ? resim.length : 0);
    console.log('- Resim başlangıcı:', resim ? resim.substring(0, 50) + '...' : 'Yok');

    // Oyuncuyu ekle
    const [result] = await db.query(
      'INSERT INTO oyuncular (adSoyad, resim) VALUES (?, ?)',
      [adSoyad, resim]
    );
    const oyuncuId = result.insertId;
    console.log('Oyuncu eklendi, ID:', oyuncuId);

    // Eklenen resmi kontrol et
    const [[kontrol]] = await db.query('SELECT resim FROM oyuncular WHERE id = ?', [oyuncuId]);
    console.log('Veritabanına kaydedilen resim var mı?:', kontrol.resim ? 'Evet' : 'Hayır');
    console.log('Veritabanındaki resim uzunluğu:', kontrol.resim ? kontrol.resim.length : 0);

    // Pozisyonları ekle
    if (pozisyonlar) {
      const pozisyonEslestirme = { MC: 'CM' }; // MC -> CM dönüşümü için
      const pozisyonVerileri = {};
      
      for (const [pozisyon, seviye] of Object.entries(pozisyonlar)) {
        const dbPozisyon = pozisyonEslestirme[pozisyon] || pozisyon;
        if (seviye >= 1 && seviye <= 5) {
          pozisyonVerileri[dbPozisyon] = seviye;
        }
      }

      if (Object.keys(pozisyonVerileri).length > 0) {
        const columns = ['oyuncu_id', ...Object.keys(pozisyonVerileri)];
        const values = [oyuncuId, ...Object.values(pozisyonVerileri)];
        const placeholders = Array(values.length).fill('?').join(',');
        
        await db.query(
          `INSERT INTO pozisyonlar (${columns.join(',')}) VALUES (${placeholders})`,
          values
        );
        console.log('Pozisyonlar eklendi:', pozisyonVerileri);
      }
    }

    // Grupları ekle
    if (gruplar && gruplar.length > 0) {
      const grupValues = gruplar.map(grup => {
        const grupId = typeof grup === 'number' ? grup : (grup && grup.id ? grup.id : null);
        return [oyuncuId, grupId];
      }).filter(([_, grupId]) => grupId !== null);

      if (grupValues.length > 0) {
        await db.query(
          'INSERT INTO oyuncu_gruplar (oyuncu_id, grup_id) VALUES ?',
          [grupValues]
        );
        console.log('Gruplar eklendi');
      }
    }

    // Eklenen oyuncunun tüm bilgilerini getir
    const [[oyuncu]] = await db.query(`
      SELECT o.*, 
             p.ST, p.OOS, p.RW, p.LW, p.CM, p.DM, p.DC, p.DR, p.DL, p.GK
      FROM oyuncular o
      LEFT JOIN pozisyonlar p ON o.id = p.oyuncu_id
      WHERE o.id = ?
    `, [oyuncuId]);

    res.json(oyuncu);
  } catch (error) {
    console.error('Oyuncu eklenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncu güncelle
app.put('/api/oyuncular/:id', async (req, res) => {
  try {
    const oyuncuId = parseInt(req.params.id);
    const { adSoyad, pozisyonlar, gruplar } = req.body;
    console.log('Gelen veriler:', { adSoyad, pozisyonlar, gruplar });

    // Oyuncunun var olup olmadığını kontrol et
    const [oyuncuKontrol] = await db.query('SELECT * FROM oyuncular WHERE id = ?', [oyuncuId]);
    if (!oyuncuKontrol || oyuncuKontrol.length === 0) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    // adSoyad alanı varsa güncelle
    if (adSoyad) {
      await db.query('UPDATE oyuncular SET adSoyad = ? WHERE id = ?', [adSoyad, oyuncuId]);
    }

    // Pozisyonları güncelle
    if (pozisyonlar) {
      const pozisyonSorgusu = Object.entries(pozisyonlar)
        .map(([key, value]) => `${key} = ${parseInt(value)}`)
        .join(', ');
      
      if (pozisyonSorgusu) {
        await db.query(`UPDATE pozisyonlar SET ${pozisyonSorgusu} WHERE oyuncu_id = ?`, [oyuncuId]);
      }
    }

    // Grupları güncelle
    if (Array.isArray(gruplar) && gruplar.length > 0) {
      // Mevcut grupları sil
      await db.query('DELETE FROM oyuncu_gruplar WHERE oyuncu_id = ?', [oyuncuId]);
      
      // Yeni grupları ekle
      const grupValues = gruplar.map(grup => [oyuncuId, parseInt(grup.id)]);
      await db.query('INSERT INTO oyuncu_gruplar (oyuncu_id, grup_id) VALUES ?', [grupValues]);
    }

    // Güncellenmiş oyuncu bilgilerini getir
    const [[oyuncu]] = await db.query('SELECT * FROM oyuncular WHERE id = ?', [oyuncuId]);
    
    // Pozisyonları getir
    const [pozisyonlarSonuc] = await db.query('SELECT * FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);
    if (pozisyonlarSonuc && pozisyonlarSonuc.length > 0) {
      oyuncu.pozisyonlar = pozisyonlarSonuc[0];
      delete oyuncu.pozisyonlar.id;
      delete oyuncu.pozisyonlar.oyuncu_id;
      delete oyuncu.pozisyonlar.created_at;
      delete oyuncu.pozisyonlar.updated_at;
    }

    // Grupları getir
    const [gruplarSonuc] = await db.query(`
      SELECT g.* 
      FROM gruplar g
      INNER JOIN oyuncu_gruplar og ON g.id = og.grup_id
      WHERE og.oyuncu_id = ?
    `, [oyuncuId]);
    oyuncu.gruplar = gruplarSonuc;
    
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
      SELECT 
        bitiricilik, dripling, ilkkontrol, kafavurusu, korner,
        markaj, ortayapma, pas, penaltikullanma, serbestvuruskullanma,
        teknik, topkapma, uzaktansut, uzuntac, agresiflik,
        cesaret, caliskanlik, kararalma, kararlilik, konsantrasyon,
        liderlik, onsezi, ozelyetenek, pozisyonalma, sogukkanlilik,
        takimoyunu, topsuzalan, vizyon, ceviklik, dayaniklilik,
        denge, guc, hiz, hizlanma, vucutzindeligi, ziplama
      FROM oyuncu_ozellikleri 
      WHERE oyuncu_id = ?
    `, [oyuncuId]);
    
    // Eğer oyuncunun yetenek kaydı yoksa varsayılan değerlerle oluştur
    if (!yetenekler || yetenekler.length === 0) {
      await db.query('INSERT INTO oyuncu_ozellikleri (oyuncu_id) VALUES (?)', [oyuncuId]);
      const [yeniYetenekler] = await db.query(`
        SELECT 
          bitiricilik, dripling, ilkkontrol, kafavurusu, korner,
          markaj, ortayapma, pas, penaltikullanma, serbestvuruskullanma,
          teknik, topkapma, uzaktansut, uzuntac, agresiflik,
          cesaret, caliskanlik, kararalma, kararlilik, konsantrasyon,
          liderlik, onsezi, ozelyetenek, pozisyonalma, sogukkanlilik,
          takimoyunu, topsuzalan, vizyon, ceviklik, dayaniklilik,
          denge, guc, hiz, hizlanma, vucutzindeligi, ziplama
        FROM oyuncu_ozellikleri 
        WHERE oyuncu_id = ?
      `, [oyuncuId]);
      
      res.json(yeniYetenekler[0]);
    } else {
      res.json(yetenekler[0]);
    }
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
    
    console.log('Gelen yetenekler:', yetenekler);

    // Yetenekler kontrolü
    if (!yetenekler || !Array.isArray(yetenekler)) {
      return res.status(400).json({ error: 'Yetenekler bir dizi olarak gönderilmelidir' });
    }

    // Önce oyuncunun mevcut olup olmadığını kontrol et
    const [oyuncu] = await db.query('SELECT * FROM oyuncular WHERE id = ?', [oyuncuId]);
    if (!oyuncu || oyuncu.length === 0) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    // Oyuncunun özelliklerini güncelle
    for (const yetenek of yetenekler) {
      try {
        // Özellik adını al
        const [ozellik] = await db.query('SELECT isim FROM ozellikler WHERE id = ?', [yetenek.ozellik_id]);
        
        if (ozellik && ozellik.length > 0) {
          // Özellik adını normalize et
          let kolonAdi = ozellik[0].isim
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Aksanları kaldır
            .toLowerCase()
            .replace(/İ/g, 'i')
            .replace(/I/g, 'i')
            .replace(/ı/g, 'i')
            .replace(/Ğ/g, 'g')
            .replace(/ğ/g, 'g')
            .replace(/Ü/g, 'u')
            .replace(/ü/g, 'u')
            .replace(/Ş/g, 's')
            .replace(/ş/g, 's')
            .replace(/Ö/g, 'o')
            .replace(/ö/g, 'o')
            .replace(/Ç/g, 'c')
            .replace(/ç/g, 'c')
            .replace(/\s+/g, '');

          console.log('Güncellenecek kolon:', kolonAdi, 'Değer:', yetenek.seviye);
          
          // Yeteneği güncelle
          await db.query(`
            UPDATE oyuncu_ozellikleri 
            SET ?? = ?
            WHERE oyuncu_id = ?
          `, [kolonAdi, yetenek.seviye, oyuncuId]);
        }
      } catch (error) {
        console.error('Yetenek güncellenirken hata:', error);
        console.log('Hatalı yetenek:', yetenek);
      }
    }

    // İlk 10 güç hesaplama sorgusunu al
    const [gucQueries] = await db.query('SELECT q_query FROM queryler WHERE q_id <= 10 ORDER BY q_id');
    
    if (!gucQueries || gucQueries.length === 0) {
      throw new Error('Güç hesaplama sorguları bulunamadı');
    }

    // Her sorguyu çalıştır ve güç değerlerini topla
    let enYuksekGuc = 0;
    for (const query of gucQueries) {
      // Sorgu içindeki @oyuncu_id'yi güncelle
      const modifiedQuery = query.q_query.replace(/@oyuncu_id/g, oyuncuId);
      const [[gucSonuc]] = await db.query(modifiedQuery);
      
      if (gucSonuc && gucSonuc.MevkiGucDegerleri) {
        // MevkiGucDegerleri'nden sayısal değeri çıkar
        const gucDegeri = parseFloat(gucSonuc.MevkiGucDegerleri.split(':')[1]);
        if (!isNaN(gucDegeri) && gucDegeri > enYuksekGuc) {
          enYuksekGuc = gucDegeri;
        }
      }
    }

    // En yüksek güç değerini kaydet
    await db.query('UPDATE oyuncular SET guc = ? WHERE id = ?', [enYuksekGuc, oyuncuId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Yetenekler güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncuya pozisyon ekle
app.post('/api/oyuncular/:id/pozisyonlar', async (req, res) => {
  try {
    const oyuncuId = req.params.id;
    const { pozisyon, seviye } = req.body;

    console.log('Gelen pozisyon verisi:', req.body);

    // Önce oyuncunun var olup olmadığını kontrol et
    const [[oyuncuKontrol]] = await db.query('SELECT id FROM oyuncular WHERE id = ?', [oyuncuId]);
    if (!oyuncuKontrol) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    // Mevcut pozisyon kaydını kontrol et
    const [pozisyonKaydi] = await db.query('SELECT id FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);

    if (!pozisyonKaydi || pozisyonKaydi.length === 0) {
      // Pozisyon kaydı yoksa yeni kayıt oluştur (tüm pozisyonlar varsayılan olarak 1)
      await db.query('INSERT INTO pozisyonlar (oyuncu_id) VALUES (?)', [oyuncuId]);
    }

    // Pozisyonu güncelle
    if (pozisyon && seviye >= 1 && seviye <= 5) {
      // MC pozisyonunu CM olarak değiştir
      const dbPozisyon = pozisyon === 'MC' ? 'CM' : pozisyon;
      
      const updateQuery = `
        UPDATE pozisyonlar 
        SET ${dbPozisyon} = ?, updated_at = NOW()
        WHERE oyuncu_id = ?
      `;
      
      console.log('Pozisyon güncelleme sorgusu:', updateQuery);
      console.log('Pozisyon değerleri:', [seviye, oyuncuId]);
      
      await db.query(updateQuery, [seviye, oyuncuId]);
    }

    // Güncellenmiş pozisyonları getir
    const [[guncelPozisyonlar]] = await db.query('SELECT * FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);
    
    res.json(guncelPozisyonlar);
  } catch (error) {
    console.error('Pozisyon eklenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncunun pozisyonlarını getir
app.get('/api/oyuncular/:id/pozisyonlar', async (req, res) => {
  try {
    const oyuncuId = req.params.id;

    // Önce oyuncunun var olup olmadığını kontrol et
    const [[oyuncuKontrol]] = await db.query('SELECT id FROM oyuncular WHERE id = ?', [oyuncuId]);
    if (!oyuncuKontrol) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    // Pozisyonları getir
    const [pozisyonlar] = await db.query('SELECT * FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);

    if (!pozisyonlar || pozisyonlar.length === 0) {
      // Pozisyon kaydı yoksa yeni kayıt oluştur
      await db.query('INSERT INTO pozisyonlar (oyuncu_id) VALUES (?)', [oyuncuId]);
      const [yeniPozisyonlar] = await db.query('SELECT * FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);
      return res.json(yeniPozisyonlar[0]);
    }

    res.json(pozisyonlar[0]);
  } catch (error) {
    console.error('Pozisyonlar getirilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncunun pozisyonlarını güncelle
app.put('/api/oyuncular/:id/pozisyonlar', async (req, res) => {
  try {
    const oyuncuId = req.params.id;
    const pozisyonlar = req.body;

    console.log('Gelen pozisyon güncellemeleri:', pozisyonlar);

    // Önce oyuncunun var olup olmadığını kontrol et
    const [[oyuncuKontrol]] = await db.query('SELECT id FROM oyuncular WHERE id = ?', [oyuncuId]);
    if (!oyuncuKontrol) {
      return res.status(404).json({ error: 'Oyuncu bulunamadı' });
    }

    // Mevcut pozisyon kaydını kontrol et
    const [pozisyonKaydi] = await db.query('SELECT id FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);

    if (!pozisyonKaydi || pozisyonKaydi.length === 0) {
      // Pozisyon kaydı yoksa yeni kayıt oluştur
      await db.query('INSERT INTO pozisyonlar (oyuncu_id) VALUES (?)', [oyuncuId]);
    }

    // Pozisyonları güncelle
    const updateFields = [];
    const updateValues = [];

    Object.entries(pozisyonlar).forEach(([pozisyon, seviye]) => {
      if (typeof seviye === 'number' && seviye >= 1 && seviye <= 5) {
        // MC pozisyonunu CM olarak değiştir
        const dbPozisyon = pozisyon === 'MC' ? 'CM' : pozisyon;
        updateFields.push(`${dbPozisyon} = ?`);
        updateValues.push(seviye);
      }
    });

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE pozisyonlar 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE oyuncu_id = ?
      `;
      
      console.log('Pozisyon güncelleme sorgusu:', updateQuery);
      console.log('Pozisyon değerleri:', [...updateValues, oyuncuId]);
      
      await db.query(updateQuery, [...updateValues, oyuncuId]);
    }

    // Güncellenmiş pozisyonları getir
    const [[guncelPozisyonlar]] = await db.query('SELECT * FROM pozisyonlar WHERE oyuncu_id = ?', [oyuncuId]);
    
    res.json(guncelPozisyonlar);
  } catch (error) {
    console.error('Pozisyonlar güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Profil resmi yükleme endpoint'i
app.post('/api/oyuncular/:id/resim', upload.single('resim'), async (req, res) => {
  try {
    const oyuncuId = parseInt(req.params.id);
    console.log('Uploading profile picture for player:', oyuncuId);
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'Resim yüklenmedi' });
    }

    console.log('File details:', req.file);

    // Eski resmi kontrol et ve sil
    const [oyuncu] = await db.query('SELECT resim FROM oyuncular WHERE id = ?', [oyuncuId]);
    if (oyuncu.length > 0 && oyuncu[0].resim) {
      const eskiResimYolu = path.join(process.cwd(), oyuncu[0].resim);
      console.log('Old image path:', eskiResimYolu);
      if (fs.existsSync(eskiResimYolu)) {
        console.log('Deleting old image...');
        fs.unlinkSync(eskiResimYolu);
        console.log('Old image deleted successfully');
      }
    }

    // Yeni resim yolunu kaydet
    const resimYolu = path.join('uploads/profil', req.file.filename).replace(/\\/g, '/');
    console.log('New image path to save:', resimYolu);
    
    await db.query('UPDATE oyuncular SET resim = ? WHERE id = ?', [resimYolu, oyuncuId]);
    console.log('Database updated successfully');

    res.json({ 
      message: 'Profil resmi güncellendi',
      resimYolu: resimYolu
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Profil resmi yüklenemedi' });
  }
});

// Statik dosya sunucusu
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
}); 
