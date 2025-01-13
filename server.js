// Veritabanını başlat
async function initializeDatabase() {
  try {
    // Oyuncular tablosunu oluştur
    await db.query(`
      CREATE TABLE IF NOT EXISTS oyuncular (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ad_soyad VARCHAR(255) NOT NULL,
        resim TEXT,
        guc INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('oyuncular tablosu oluşturuldu');

    // Kaleci yetenekleri tablosunu oluştur
    await db.query(`
      CREATE TABLE IF NOT EXISTS kaleci_yetenekleri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        oyuncu_id INT NOT NULL,
        ani_cikis_egilimi INT DEFAULT 1,
        birebir INT DEFAULT 1,
        degaj INT DEFAULT 1,
        eksantriklik INT DEFAULT 1,
        elle_kontrol INT DEFAULT 1,
        elle_oyun_baslatma INT DEFAULT 1,
        hava_toplari INT DEFAULT 1,
        ilk_kontrol INT DEFAULT 1,
        pas INT DEFAULT 1,
        refleksler INT DEFAULT 1,
        yumrukla_uzaklastirma INT DEFAULT 1,
        agresiflik INT DEFAULT 1,
        cesaret INT DEFAULT 1,
        karar_alma INT DEFAULT 1,
        kararlilik INT DEFAULT 1,
        konsantrasyon INT DEFAULT 1,
        liderlik INT DEFAULT 1,
        onsezi INT DEFAULT 1,
        sogukkanlilik INT DEFAULT 1,
        takim_oyunu INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (oyuncu_id) REFERENCES oyuncular(id) ON DELETE CASCADE
      )
    `);
    console.log('kaleci_yetenekleri tablosu oluşturuldu');

    // oyuncular tablosuna kaleci_gucu kolonu ekle
    await db.query(`
      ALTER TABLE oyuncular
      ADD COLUMN IF NOT EXISTS kaleci_gucu INT DEFAULT 0
    `);
    console.log('oyuncular tablosuna kaleci_gucu kolonu eklendi');

    // ... existing code ...
  } catch (error) {
    console.error('Veritabanı başlatılırken hata:', error);
    throw error;
  }
}

// Middleware'leri ayarla
app.use(cors());
app.use(express.json());

// Kaleci yeteneklerini getir
app.get('/api/kaleci-yetenekleri/:oyuncuId', async (req, res) => {
  const { oyuncuId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM kaleci_yetenekleri WHERE oyuncu_id = ?',
      [oyuncuId]
    );

    if (rows.length === 0) {
      // Kaleci yetenekleri bulunamadıysa varsayılan değerleri döndür
      const varsayilanYetenekler = {
        ani_cikis_egilimi: 1,
        birebir: 1,
        degaj: 1,
        eksantriklik: 1,
        elle_kontrol: 1,
        elle_oyun_baslatma: 1,
        hava_toplari: 1,
        ilk_kontrol: 1,
        pas: 1,
        refleksler: 1,
        yumrukla_uzaklastirma: 1,
        agresiflik: 1,
        cesaret: 1,
        karar_alma: 1,
        kararlilik: 1,
        konsantrasyon: 1,
        liderlik: 1,
        onsezi: 1,
        sogukkanlilik: 1,
        takim_oyunu: 1
      };
      res.json(varsayilanYetenekler);
    } else {
      // Veritabanından gelen değerleri döndür
      const yetenekler = rows[0];
      delete yetenekler.id;
      delete yetenekler.oyuncu_id;
      delete yetenekler.created_at;
      delete yetenekler.updated_at;
      res.json(yetenekler);
    }
  } catch (error) {
    console.error('Kaleci yetenekleri alınırken hata:', error);
    res.status(500).json({ error: 'Kaleci yetenekleri alınamadı' });
  }
});

// Kaleci yeteneklerini güncelle/ekle
app.put('/api/kaleci-yetenekleri/:oyuncuId', async (req, res) => {
  const { oyuncuId } = req.params;
  const yetenekler = req.body;

  try {
    // Önce mevcut kaydı kontrol et
    const [rows] = await db.query(
      'SELECT id FROM kaleci_yetenekleri WHERE oyuncu_id = ?',
      [oyuncuId]
    );

    let query;
    let values;

    if (rows.length === 0) {
      // Kayıt yoksa yeni kayıt ekle
      query = `
        INSERT INTO kaleci_yetenekleri (
          oyuncu_id, ani_cikis_egilimi, birebir, degaj, eksantriklik,
          elle_kontrol, elle_oyun_baslatma, hava_toplari, ilk_kontrol,
          pas, refleksler, yumrukla_uzaklastirma, agresiflik, cesaret,
          karar_alma, kararlilik, konsantrasyon, liderlik, onsezi,
          sogukkanlilik, takim_oyunu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      values = [
        oyuncuId,
        yetenekler.ani_cikis_egilimi,
        yetenekler.birebir,
        yetenekler.degaj,
        yetenekler.eksantriklik,
        yetenekler.elle_kontrol,
        yetenekler.elle_oyun_baslatma,
        yetenekler.hava_toplari,
        yetenekler.ilk_kontrol,
        yetenekler.pas,
        yetenekler.refleksler,
        yetenekler.yumrukla_uzaklastirma,
        yetenekler.agresiflik,
        yetenekler.cesaret,
        yetenekler.karar_alma,
        yetenekler.kararlilik,
        yetenekler.konsantrasyon,
        yetenekler.liderlik,
        yetenekler.onsezi,
        yetenekler.sogukkanlilik,
        yetenekler.takim_oyunu
      ];
    } else {
      // Kayıt varsa güncelle
      query = `
        UPDATE kaleci_yetenekleri SET
          ani_cikis_egilimi = ?,
          birebir = ?,
          degaj = ?,
          eksantriklik = ?,
          elle_kontrol = ?,
          elle_oyun_baslatma = ?,
          hava_toplari = ?,
          ilk_kontrol = ?,
          pas = ?,
          refleksler = ?,
          yumrukla_uzaklastirma = ?,
          agresiflik = ?,
          cesaret = ?,
          karar_alma = ?,
          kararlilik = ?,
          konsantrasyon = ?,
          liderlik = ?,
          onsezi = ?,
          sogukkanlilik = ?,
          takim_oyunu = ?
        WHERE oyuncu_id = ?
      `;
      values = [
        yetenekler.ani_cikis_egilimi,
        yetenekler.birebir,
        yetenekler.degaj,
        yetenekler.eksantriklik,
        yetenekler.elle_kontrol,
        yetenekler.elle_oyun_baslatma,
        yetenekler.hava_toplari,
        yetenekler.ilk_kontrol,
        yetenekler.pas,
        yetenekler.refleksler,
        yetenekler.yumrukla_uzaklastirma,
        yetenekler.agresiflik,
        yetenekler.cesaret,
        yetenekler.karar_alma,
        yetenekler.kararlilik,
        yetenekler.konsantrasyon,
        yetenekler.liderlik,
        yetenekler.onsezi,
        yetenekler.sogukkanlilik,
        yetenekler.takim_oyunu,
        oyuncuId
      ];
    }

    await db.query(query, values);

    // Kaleci gücünü hesapla (tüm yeteneklerin ortalaması)
    const kaleciGucu = Math.round(
      Object.values(yetenekler).reduce((sum, value) => sum + value, 0) / 
      Object.keys(yetenekler).length
    );

    // Oyuncunun kaleci_gucu değerini güncelle
    await db.query(
      'UPDATE oyuncular SET kaleci_gucu = ? WHERE id = ?',
      [kaleciGucu, oyuncuId]
    );

    res.json({ kaleciGucu });
  } catch (error) {
    console.error('Kaleci yetenekleri güncellenirken hata:', error);
    res.status(500).json({ error: 'Kaleci yetenekleri güncellenemedi' });
  }
}); 
