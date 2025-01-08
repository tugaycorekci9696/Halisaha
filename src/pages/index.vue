<template>
  <div>
    <VRow>
      <!-- Oyuncu Havuzu -->
      <VCol cols="12" md="4">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <VSpacer />
            <div class="d-flex gap-2">
              <VBtn
                color="primary"
                size="small"
                prepend-icon="tabler-plus"
                @click="formasyonDialogAc"
              >
                Formasyon Ekle
              </VBtn>
              <VBtn
                color="error"
                size="small"
                prepend-icon="tabler-refresh"
                @click="takimlariSifirla"
              >
                Sıfırla
              </VBtn>
            </div>
          </VCardTitle>
          <VCardText>
            <div v-if="havuzdakiOyuncular.length === 0" class="text-center pa-4">
              <VProgressCircular indeterminate color="primary" />
              <div class="text-body-1 mt-2">Oyuncular Yükleniyor...</div>
            </div>
            <div v-else>
              <div v-for="oyuncu in filtrelenmisOyuncular" 
                   :key="oyuncu.id"
                   class="oyuncu-listesi-item"
                   draggable="true"
                   @dragstart="(e) => dragStart(e, oyuncu)">
                <div class="d-flex align-center">
                  <VAvatar size="40" class="me-3">
                    <VImg v-if="oyuncu.resim" :src="oyuncu.resim" />
                    <VIcon v-else icon="tabler-user" />
                  </VAvatar>
                  <div class="oyuncu-bilgi flex-grow-1">
                    <div class="text-subtitle-2">{{ oyuncu.adSoyad }}</div>
                    <div class="pozisyon-dots d-flex gap-1 mt-1">
                      <template v-for="(seviye, poz) in siraliPozisyonlar(oyuncu.pozisyonlar || {})" :key="poz">
                        <div v-if="seviye >= 3"
                             class="pozisyon-dot"
                             :class="[poz, `seviye-${seviye}`]"
                             :title="getPozisyonAciklama(String(poz), seviye)">
                          {{ poz }}
                        </div>
                      </template>
                    </div>
                  </div>
                  <VChip :color="oyuncuGucRengi(oyuncu.guc)" size="small">
                    {{ oyuncu.guc }}
                  </VChip>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Sahalar -->
      <VCol cols="12" md="8">
        <VRow>
          <!-- Buraya yeni sahalar eklenecek -->
        </VRow>
      </VCol>
    </VRow>

    <!-- Formasyon Ekleme Dialog -->
    <VDialog v-model="formasyonDialog" max-width="600px">
      <VCard>
        <VCardTitle>Yeni Formasyon Ekle</VCardTitle>
        <VCardText>
          <VTextField
            v-model="yeniFormasyon.isim"
            label="Formasyon İsmi"
            variant="outlined"
            class="mb-4"
          />
          <div class="saha-preview">
            <!-- Forvet -->
            <div class="saha-row">
              <div class="d-flex align-center justify-space-between w-100">
                <span>Forvet (ST)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.ST"
                  :min="0"
                  :max="3"
                  :step="1"
                  :ticks="[0,1,2,3]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
            </div>
            <!-- Kanat ve OOS -->
            <div class="saha-row">
              <div class="d-flex align-center justify-space-between w-100">
                <span>Sol Kanat (LW)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.LW"
                  :min="0"
                  :max="2"
                  :step="1"
                  :ticks="[0,1,2]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
              <div class="d-flex align-center justify-space-between w-100">
                <span>Ofansif Orta Saha (OOS)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.OOS"
                  :min="0"
                  :max="3"
                  :step="1"
                  :ticks="[0,1,2,3]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
              <div class="d-flex align-center justify-space-between w-100">
                <span>Sağ Kanat (RW)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.RW"
                  :min="0"
                  :max="2"
                  :step="1"
                  :ticks="[0,1,2]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
            </div>
            <!-- Orta Saha -->
            <div class="saha-row">
              <div class="d-flex align-center justify-space-between w-100">
                <span>Orta Saha (CM)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.CM"
                  :min="0"
                  :max="3"
                  :step="1"
                  :ticks="[0,1,2,3]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
            </div>
            <!-- Defansif Orta Saha -->
            <div class="saha-row">
              <div class="d-flex align-center justify-space-between w-100">
                <span>Defansif Orta Saha (DM)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.DM"
                  :min="0"
                  :max="2"
                  :step="1"
                  :ticks="[0,1,2]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
            </div>
            <!-- Defans -->
            <div class="saha-row">
              <div class="d-flex align-center justify-space-between w-100">
                <span>Sol Bek (DL)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.DL"
                  :min="0"
                  :max="2"
                  :step="1"
                  :ticks="[0,1,2]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
              <div class="d-flex align-center justify-space-between w-100">
                <span>Stoper (DC)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.DC"
                  :min="0"
                  :max="2"
                  :step="1"
                  :ticks="[0,1,2]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
              <div class="d-flex align-center justify-space-between w-100">
                <span>Sağ Bek (DR)</span>
                <VSlider
                  v-model="yeniFormasyon.pozisyonlar.DR"
                  :min="0"
                  :max="2"
                  :step="1"
                  :ticks="[0,1,2]"
                  :thumb-size="20"
                  class="w-25"
                  density="compact"
                />
              </div>
            </div>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="error" @click="formasyonDialog = false">İptal</VBtn>
          <VBtn color="primary" @click="formasyonKaydet">Kaydet</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import api from '@/services/api'
import { computed, onMounted, ref } from 'vue'

interface Oyuncu {
  id: number
  adSoyad: string
  resim?: string
  guc?: number
  pozisyonlar?: {
    [key: string]: number
  }
}

interface Takim {
  isim: string
  formasyon?: number
  oyuncular: {
    [key: string]: {
      [key: number]: Oyuncu
    }
  }
}

interface Formasyon {
  id: number
  isim: string
  pozisyonlar: {
    [key: string]: number
  }
}

interface Pozisyon {
  kod: string
  isim: string
}

const havuzdakiOyuncular = ref<Oyuncu[]>([])
const takimA = ref<Takim>({
  isim: 'Takım A',
  formasyon: undefined,
  oyuncular: {
    ST: {}, LW: {}, OOS: {}, RW: {},
    CM: {}, DM: {},
    DL: {}, DC: {}, DR: {},
    GK: {}
  }
})

const takimB = ref<Takim>({
  isim: 'Takım B',
  formasyon: undefined,
  oyuncular: {
    ST: {}, LW: {}, OOS: {}, RW: {},
    CM: {}, DM: {},
    DL: {}, DC: {}, DR: {},
    GK: {}
  }
})

const formasyonlar = ref<Formasyon[]>([])
const formasyonDialog = ref(false)
const yeniFormasyon = ref({
  isim: '',
  pozisyonlar: {
    GK: 1, // Kaleci her zaman 1
    ST: 0,
    LW: 0,
    OOS: 0,
    RW: 0,
    CM: 0,
    DM: 0,
    DL: 0,
    DC: 0,
    DR: 0
  }
})

const pozisyonlar = ref<Pozisyon[]>([])

const filtrelenmisOyuncular = computed(() => {
  return havuzdakiOyuncular.value.filter(oyuncu => !oyuncununTakimi(oyuncu.id))
})

// Oyuncuları yükle
const oyunculariYukle = async () => {
  try {
    havuzdakiOyuncular.value = await api.getOyuncular()
  } catch (error) {
    console.error('Oyuncular yüklenirken hata:', error)
  }
}

// Sürükle-bırak işlemleri
const dragStart = (event: DragEvent, oyuncu: Oyuncu) => {
  event.dataTransfer?.setData('oyuncuId', oyuncu.id.toString())
}

const dragStartPozisyon = (event: DragEvent, takimKodu: 'A' | 'B', pozisyon: string, index: number) => {
  const oyuncu = getPozisyonOyuncu(takimKodu, pozisyon, index)
  if (!oyuncu) return

  event.dataTransfer?.setData('oyuncuId', oyuncu.id.toString())
  event.dataTransfer?.setData('kaynakTakim', takimKodu)
  event.dataTransfer?.setData('kaynakPozisyon', pozisyon)
  event.dataTransfer?.setData('kaynakIndex', index.toString())
}

const dropOnPozisyon = (event: DragEvent, takimKodu: 'A' | 'B', pozisyon: string, index: number) => {
  event.preventDefault()
  const oyuncuId = event.dataTransfer?.getData('oyuncuId')
  const kaynakTakim = event.dataTransfer?.getData('kaynakTakim') as 'A' | 'B'
  const kaynakPozisyon = event.dataTransfer?.getData('kaynakPozisyon')
  const kaynakIndex = event.dataTransfer?.getData('kaynakIndex')

  if (!oyuncuId) return

  let oyuncu: Oyuncu | null = null
  let hedefOyuncu: Oyuncu | null = null

  // Hedef pozisyondaki oyuncuyu al
  hedefOyuncu = getPozisyonOyuncu(takimKodu, pozisyon, index)

  // Eğer havuzdan geliyorsa
  if (!kaynakTakim) {
    oyuncu = havuzdakiOyuncular.value.find(o => o.id === Number(oyuncuId)) || null
  } else {
    // Eğer başka bir pozisyondan geliyorsa
    oyuncu = getPozisyonOyuncu(kaynakTakim, kaynakPozisyon!, Number(kaynakIndex))
    if (oyuncu) {
      // Eski pozisyondan kaldır
      const eskiTakim = kaynakTakim === 'A' ? takimA : takimB
      delete eskiTakim.value.oyuncular[kaynakPozisyon!][Number(kaynakIndex)]

      // Eğer hedef pozisyonda oyuncu varsa, eski pozisyona taşı
      if (hedefOyuncu) {
        eskiTakim.value.oyuncular[kaynakPozisyon!][Number(kaynakIndex)] = hedefOyuncu
      }
    }
  }

  if (!oyuncu) return

  // Yeni pozisyona yerleştir
  const takim = kaynakTakim === 'A' ? takimA : takimB
  takim.value.oyuncular[pozisyon] = {
    ...takim.value.oyuncular[pozisyon],
    [index]: oyuncu
  }
}

const dropOnSaha = (event: DragEvent, takimKodu: 'A' | 'B') => {
  event.preventDefault()
}

const oyuncuyuKaldir = (takimKodu: 'A' | 'B', pozisyon: string, index: number) => {
  const takim = takimKodu === 'A' ? takimA : takimB
  delete takim.value.oyuncular[pozisyon][index]
}

const getPozisyonOyuncu = (takimKodu: 'A' | 'B', pozisyon: string, index: number): Oyuncu | null => {
  const takim = takimKodu === 'A' ? takimA : takimB
  return takim.value.oyuncular[pozisyon][index] || null
}

const oyuncununTakimi = (oyuncuId: number): boolean => {
  // A Takımında ara
  for (const pozisyon in takimA.value.oyuncular) {
    for (const index in takimA.value.oyuncular[pozisyon]) {
      if (takimA.value.oyuncular[pozisyon][index]?.id === oyuncuId) return true
    }
  }
  
  // B Takımında ara
  for (const pozisyon in takimB.value.oyuncular) {
    for (const index in takimB.value.oyuncular[pozisyon]) {
      if (takimB.value.oyuncular[pozisyon][index]?.id === oyuncuId) return true
    }
  }
  
  return false
}

const oyuncuGucRengi = (guc?: number) => {
  if (!guc) return 'default'
  if (guc >= 80) return 'success'
  if (guc >= 60) return 'info'
  return 'error'
}

const takimlariSifirla = () => {
  takimA.value = {
    isim: 'Takım A',
    formasyon: undefined,
    oyuncular: {
      ST: {}, LW: {}, OOS: {}, RW: {},
      CM: {}, DM: {},
      DL: {}, DC: {}, DR: {},
      GK: {}
    }
  }
  
  takimB.value = {
    isim: 'Takım B',
    formasyon: undefined,
    oyuncular: {
      ST: {}, LW: {}, OOS: {}, RW: {},
      CM: {}, DM: {},
      DL: {}, DC: {}, DR: {},
      GK: {}
    }
  }
}

const formasyonDialogAc = () => {
  yeniFormasyon.value = {
    isim: '',
    pozisyonlar: {
      GK: 1, // Kaleci her zaman 1
      ST: 0,
      LW: 0,
      OOS: 0,
      RW: 0,
      CM: 0,
      DM: 0,
      DL: 0,
      DC: 0,
      DR: 0
    }
  }
  formasyonDialog.value = true
}

const formasyonKaydet = async () => {
  try {
    if (!yeniFormasyon.value.isim) {
      alert('Lütfen formasyon ismi giriniz')
      return
    }

    const toplamOyuncu = Object.values(yeniFormasyon.value.pozisyonlar).reduce((a, b) => a + b, 0)
    if (toplamOyuncu !== 7) {
      alert('Toplam 7 oyuncu olmalıdır (6 saha oyuncusu + 1 kaleci)')
      return
    }

    await api.createFormasyon(yeniFormasyon.value)
    formasyonDialog.value = false
    formasyonlariYukle()
  } catch (error) {
    console.error('Formasyon kaydedilirken hata:', error)
    alert('Formasyon kaydedilirken bir hata oluştu')
  }
}

const formasyonlariYukle = async () => {
  try {
    formasyonlar.value = await api.getFormasyonlar()
  } catch (error) {
    console.error('Formasyonlar yüklenirken hata:', error)
  }
}

const formasyonDegistir = (takimKodu: 'A' | 'B', formasyonId: number) => {
  const formasyon = formasyonlar.value.find(f => f.id === formasyonId)
  if (!formasyon) return
  
  const takim = takimKodu === 'A' ? takimA : takimB
  
  // Mevcut oyuncuları geçici olarak sakla
  const mevcutOyuncular: Oyuncu[] = []
  for (const poz in takim.value.oyuncular) {
    for (const idx in takim.value.oyuncular[poz]) {
      const oyuncu = takim.value.oyuncular[poz][idx]
      if (oyuncu) mevcutOyuncular.push(oyuncu)
    }
  }
  
  // Takımı sıfırla
  takim.value.oyuncular = {}
  
  // Yeni formasyon yapısını oluştur
  for (const [poz, adet] of Object.entries(formasyon.pozisyonlar)) {
    takim.value.oyuncular[poz] = {}
    // Mevcut oyuncuları yeni pozisyonlara yerleştir
    for (let i = 0; i < adet; i++) {
      if (mevcutOyuncular.length > 0) {
        takim.value.oyuncular[poz][i + 1] = mevcutOyuncular.shift()!
      }
    }
  }
}

const getPozisyonAciklama = (pozisyon: string, seviye: number) => {
  const pozisyonlar: { [key: string]: string } = {
    ST: 'Forvet',
    LW: 'Sol Kanat',
    OOS: 'Ofansif Orta Saha',
    RW: 'Sağ Kanat',
    CM: 'Orta Saha',
    DM: 'Defansif Orta Saha',
    DL: 'Sol Bek',
    DC: 'Stoper',
    DR: 'Sağ Bek',
    GK: 'Kaleci'
  }

  const seviyeler = ['Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Çok İyi']
  return `${pozisyonlar[pozisyon]}: ${seviyeler[seviye - 1]}`
}

// Pozisyonları yükle
const pozisyonlariYukle = async () => {
  try {
    pozisyonlar.value = await api.getPozisyonlar()
  } catch (error) {
    console.error('Pozisyonlar yüklenirken hata:', error)
  }
}

const siraliPozisyonlar = (pozisyonlar: { [key: string]: number }): { [key: string]: number } => {
  // Pozisyonları seviyelerine göre grupla
  const gruplar: { [key: number]: { [key: string]: number } } = {}
  
  Object.entries(pozisyonlar).forEach(([poz, seviye]) => {
    if (!gruplar[seviye]) {
      gruplar[seviye] = {}
    }
    gruplar[seviye][poz] = seviye
  })
  
  // Sıralı pozisyonları birleştir (5'ten 2'ye doğru)
  const siraliPozisyonlar: { [key: string]: number } = {}
  for (let seviye = 5; seviye >= 2; seviye--) {
    if (gruplar[seviye]) {
      Object.entries(gruplar[seviye]).forEach(([poz, sev]) => {
        siraliPozisyonlar[poz] = sev
      })
    }
  }
  
  return siraliPozisyonlar
}

onMounted(() => {
  oyunculariYukle()
  formasyonlariYukle()
  pozisyonlariYukle()
})
</script>

<style scoped>
.oyuncu-listesi-item {
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: move;
  background: white;
  transition: all 0.2s;
}

.oyuncu-listesi-item:last-child {
  border-bottom: none;
}

.oyuncu-listesi-item:hover {
  background-color: #f5f5f5;
}

.oyuncu-mini {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
}

.oyuncu-mini-bilgi {
  text-align: center;
  color: rgba(0,0,0,0.87);
  margin-top: 4px;
  font-size: 0.75rem;
}

.takim-ismi {
  font-size: 1.5rem;
  font-weight: bold;
}

@media (max-width: 600px) {
  .pozisyon-kutusu {
    width: 80px;
    height: 60px;
  }

  .oyuncu-mini-bilgi {
    font-size: 0.7rem;
  }
}

.saha {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 500px;
  background-image: linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  border: 1px solid #e0e0e0;
}

.saha-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 0 20px;
}

.pozisyon-kutusu {
  width: 70px;
  height: 70px;
  margin: 5px;
  background-color: rgba(0,0,0,0.05);
  border: 2px dashed rgba(0,0,0,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}

.pozisyon-kutusu.dolu {
  background-color: rgba(0,0,0,0.1);
  border-style: solid;
}

.pozisyon-text {
  color: rgba(0,0,0,0.6);
  font-weight: bold;
}

.formasyon-select {
  max-width: 150px;
}

.pozisyon-secici {
  max-height: 400px;
  overflow-y: auto;
}

.saha-preview {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #e0e0e0;
}

.saha-preview .saha-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: rgba(0,0,0,0.02);
  border-radius: 8px;
}

.pozisyon-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pozisyon-dot {
  font-size: 0.75rem;
  padding: 4px 6px;
  border-radius: 3px;
  font-weight: bold;
  min-width: 32px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pozisyon-dot.seviye-2 { background-color: #ffd700; color: #333; } /* Sarı - Kötü */
.pozisyon-dot.seviye-3 { background-color: #ff9800; color: white; } /* Turuncu - Ortalama */
.pozisyon-dot.seviye-4 { background-color: #2e7d32; color: white; } /* Koyu Yeşil - İyi */
.pozisyon-dot.seviye-5 { background-color: #66bb6a; color: white; } /* Açık Yeşil - Çok İyi */

@media (max-width: 600px) {
  .pozisyon-dot {
    font-size: 0.7rem;
    padding: 1px 3px;
    min-width: 28px;
  }
}
</style>
