<template>
  <div>
    <VRow>
      <!-- Oyuncu Havuzu -->
      <VCol cols="12" md="4">
        <VCard>
          <VCardTitle class="d-flex flex-wrap align-center gap-2">
              <VBtn
                color="error"
                size="small"
                prepend-icon="tabler-refresh"
                @click="takimlariSifirla"
              >
                Sıfırla
              </VBtn>
            <VSelect
              v-model="seciliGruplar"
              :items="gruplar"
              item-title="isim"
              item-value="id"
              :label="seciliGruplar.length > 0 ? seciliGruplarText : 'Gruplar'"
              multiple
              chips
              variant="outlined"
              density="compact"
              hide-details
              class="flex-grow-1"
              placeholder="Grup seçiniz..."
            />
          </VCardTitle>
          <VCardText>
            <div v-if="havuzdakiOyuncular.length === 0" class="text-center pa-4">
              <VProgressCircular indeterminate color="primary" />
              <div class="text-body-1 mt-2">Oyuncular Yükleniyor...</div>
            </div>
            <div v-else>
              <div class="oyuncu-havuzu">
                <div class="oyuncu-listesi">
                  <div
                    v-for="oyuncu in filtrelenmisOyuncular"
                   :key="oyuncu.id"
                    class="oyuncu-karti"
                   draggable="true"
                    @dragstart="dragStart($event, oyuncu)"
                    @dragend="dragEnd"
                  >
                    <div class="oyuncu-resim">
                      <VAvatar size="40">
                        <VImg
                          v-if="oyuncu.resim"
                          :src="oyuncu.resim"
                          alt="Oyuncu resmi"
                        />
                    <VIcon v-else icon="tabler-user" />
                  </VAvatar>
                    </div>
                    <div class="oyuncu-bilgi">
                      <div class="oyuncu-adi">{{ oyuncu.adSoyad }}</div>
                      <div class="oyuncu-pozisyonlar">
                        <template v-if="oyuncu.pozisyonlar">
                          <template v-for="(seviye, poz) in siraliPozisyonlar(oyuncu.pozisyonlar)" :key="poz">
                            <div v-if="Number(seviye) >= 3"
                                 :class="['position-mini-box', `level-${seviye}`]"
                                 :title="getPozisyonAciklama(String(poz), Number(seviye))">
                          {{ poz }}
                        </div>
                          </template>
                      </template>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Sahalar -->
      <VCol cols="12" md="8">
        <VRow>
          <VCol cols="12" md="6">
            <VCard height="600" class="grid-card">
              <!-- Forvet Alanı -->
              <div class="position-area forvet-area" @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 4" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', 'ST', i-1)">
                    <div v-if="takimA.oyuncular.ST[i-1]" 
                         class="player-card"
                         :data-seviye="takimA.oyuncular.ST[i-1].pozisyonlar?.ST || 1"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', 'ST', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular.ST[i-1].resim" :src="takimA.oyuncular.ST[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <span class="player-name">{{ takimA.oyuncular.ST[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">
                      <span class="position-text">ST</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Orta Saha Alanı -->
              <div class="position-area ortasaha-area" @dragover.prevent>
                <div class="position-grid">
                  <!-- İlk Sıra: LW, OOS, OOS, RW -->
                  <div v-for="(pos, index) in ['LW', 'OOS', 'OOS', 'RW'] as PozisyonKodu[]" :key="'row1-'+index" 
                       class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', pos, index)">
                    <div v-if="takimA.oyuncular[pos][index]" 
                         class="player-card"
                         :data-seviye="takimA.oyuncular[pos][index].pozisyonlar?.[pos as MevkiKodu] || 1"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', pos, index)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular[pos][index].resim" :src="takimA.oyuncular[pos][index].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <span class="player-name">{{ takimA.oyuncular[pos][index].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">
                      <span class="position-text">{{ pos }}</span>
                    </div>
                  </div>

                  <!-- İkinci Sıra: LW, CM, CM, RW -->
                  <div v-for="(pos, index) in ['LW', 'CM', 'CM', 'RW'] as PozisyonKodu[]" :key="'row2-'+index" 
                       class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', pos, index+4)">
                    <div v-if="takimA.oyuncular[pos][index+4]" 
                         class="player-card"
                         :data-seviye="takimA.oyuncular[pos][index+4].pozisyonlar?.[pos as MevkiKodu] || 1"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', pos, index+4)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular[pos][index+4].resim" :src="takimA.oyuncular[pos][index+4].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <span class="player-name">{{ takimA.oyuncular[pos][index+4].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">
                      <span class="position-text">{{ pos }}</span>
                    </div>
                  </div>

                  <!-- Üçüncü Sıra: LW, DM, DM, RW -->
                  <div v-for="(pos, index) in ['LW', 'DM', 'DM', 'RW'] as PozisyonKodu[]" :key="'row3-'+index" 
                       class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', pos, index+8)">
                    <div v-if="takimA.oyuncular[pos][index+8]" 
                         class="player-card"
                         :data-seviye="takimA.oyuncular[pos][index+8].pozisyonlar?.[pos as MevkiKodu] || 1"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', pos, index+8)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular[pos][index+8].resim" :src="takimA.oyuncular[pos][index+8].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <span class="player-name">{{ takimA.oyuncular[pos][index+8].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">
                      <span class="position-text">{{ pos }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Defans Alanı -->
              <div class="position-area defans-area" @dragover.prevent>
                <div class="position-grid">
                  <div v-for="(pos, index) in ['DL', 'DC', 'DC', 'DR'] as PozisyonKodu[]" :key="index" 
                       class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', pos, index)">
                    <div v-if="takimA.oyuncular[pos][index]" 
                         class="player-card"
                         :data-seviye="takimA.oyuncular[pos][index].pozisyonlar?.[pos as MevkiKodu] || 1"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', pos, index)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular[pos][index].resim" :src="takimA.oyuncular[pos][index].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <span class="player-name">{{ takimA.oyuncular[pos][index].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">
                      <span class="position-text">{{ pos }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Kaleci Alanı -->
              <div class="position-area kaleci-area" @dragover.prevent>
                <div class="position-slot"
                     @dragover.prevent
                     @drop="dropOnArea($event, 'A', 'GK', 0)">
                  <div v-if="takimA.oyuncular.GK[0]" 
                       class="player-card"
                       :data-seviye="takimA.oyuncular.GK[0].pozisyonlar?.GK || 1"
                       draggable="true"
                       @dragstart="dragStartPozisyon($event, 'A', 'GK', 0)">
                    <VAvatar size="40" class="player-avatar">
                      <VImg v-if="takimA.oyuncular.GK[0].resim" :src="takimA.oyuncular.GK[0].resim" />
                      <VIcon v-else icon="tabler-user" />
                    </VAvatar>
                    <span class="player-name">{{ takimA.oyuncular.GK[0].adSoyad }}</span>
                  </div>
                  <div v-else class="empty-slot">
                    <span class="position-text">GK</span>
                  </div>
                </div>
              </div>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard height="600" class="grid-card">
              <!-- B Takımı için aynı yapı -->
              <!-- ... B takımı için aynı yapıyı kopyala ... -->
            </VCard>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
import type { Grup } from '@/services/api';
import api from '@/services/api';
import { computed, onMounted, ref } from 'vue';

interface Pozisyonlar {
  GK: number;
  ST?: number;
  LW?: number;
  OOS?: number;
  RW?: number;
  CM?: number;
  DM?: number;
  DL?: number;
  DC?: number;
  DR?: number;
}

interface Oyuncu {
  id: number;
  adSoyad: string;
  resim?: string;
  pozisyonlar?: {
    [key: string]: number;
  };
  gruplar?: Grup[];
  yetenekler?: string[];
}

type MevkiKodu = 'ST' | 'CM' | 'LW' | 'RW' | 'OOS' | 'DM' | 'DL' | 'DC' | 'DR' | 'GK';

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
  pozisyonlar: Pozisyonlar
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
const pozisyonlar = ref<Pozisyon[]>([])
const seciliGruplar = ref<number[]>([])

// Gruplar ve seçili gruplar için computed property ekle
const gruplar = ref<Grup[]>([])

const seciliGruplarText = computed(() => {
  return seciliGruplar.value.length > 0 
    ? `${seciliGruplar.value.length} grup seçili` 
    : 'Gruplar'
})

// Filtrelenmiş oyuncular
const filtrelenmisOyuncular = computed(() => {
  if (seciliGruplar.value.length === 0) return []

  return havuzdakiOyuncular.value.filter(oyuncu => 
    oyuncu.gruplar?.some(grup => seciliGruplar.value.includes(grup.id)) &&
    !oyuncununTakimi(oyuncu.id)
  )
})

// Oyuncuları yükle
const oyunculariYukle = async () => {
  try {
    const oyuncular = await api.getOyuncular()
    havuzdakiOyuncular.value = oyuncular.map(o => ({
      id: o.id,
      adSoyad: o.adSoyad,
      resim: o.resim,
      gruplar: o.gruplar,
      pozisyonlar: o.pozisyonlar,
      yetenekler: o.yetenekler
    }))
  } catch (error) {
    console.error('Oyuncular yüklenirken hata:', error)
  }
}

// Grupları yükle
const gruplariYukle = async () => {
  try {
    const response = await api.getGruplar()
    gruplar.value = response
  } catch (error) {
    console.error('Gruplar yüklenirken hata:', error)
  }
}

// Sürükle-bırak işlemleri
const draggedPlayer = ref<Oyuncu | null>(null);

const dragStart = (event: DragEvent, oyuncu: Oyuncu) => {
  if (!event.dataTransfer) return;
  
  draggedPlayer.value = oyuncu;
  event.dataTransfer.setData('oyuncuId', oyuncu.id.toString());
  highlightPositions();
}

const dragEnd = () => {
  draggedPlayer.value = null;
  removeHighlights();
}

const highlightPositions = () => {
  if (!draggedPlayer.value) return;
  
  const slots = document.querySelectorAll('.position-slot');
  slots.forEach(slot => {
    const pos = slot.querySelector('.position-text')?.textContent as PozisyonKodu;
    const seviye = draggedPlayer.value?.pozisyonlar?.[pos] || 1;
    
    slot.classList.add(`highlight-level-${seviye}`);
  });
}

const removeHighlights = () => {
  const slots = document.querySelectorAll('.position-slot');
  slots.forEach(slot => {
    slot.classList.remove('highlight-level-1', 'highlight-level-2', 'highlight-level-3', 'highlight-level-4', 'highlight-level-5');
  });
}

const dragStartPozisyon = (event: DragEvent, takimKodu: 'A' | 'B', pozisyon: string, index: number) => {
  if (!event.dataTransfer) return;

  const oyuncu = getPozisyonOyuncu(takimKodu, pozisyon, index);
  if (!oyuncu) return;

  draggedPlayer.value = oyuncu;
  event.dataTransfer.setData('oyuncuId', oyuncu.id.toString());
  event.dataTransfer.setData('kaynakTakim', takimKodu);
  event.dataTransfer.setData('kaynakPozisyon', pozisyon);
  event.dataTransfer.setData('kaynakIndex', index.toString());
  highlightPositions();
}

// Pozisyonlar için tip tanımlamasını güncelle
type PozisyonKodu = 'ST' | 'LW' | 'OOS' | 'RW' | 'CM' | 'DM' | 'DL' | 'DC' | 'DR' | 'GK'

const dropOnArea = async (event: DragEvent, takimKodu: 'A' | 'B', pozisyon: PozisyonKodu, hedefIndex: number) => {
  event.preventDefault();
  
  if (!event.dataTransfer) return;
  
  const oyuncuId = event.dataTransfer.getData('oyuncuId');
  const kaynakTakim = event.dataTransfer.getData('kaynakTakim') as 'A' | 'B';
  const kaynakPozisyon = event.dataTransfer.getData('kaynakPozisyon') as keyof Pozisyonlar;
  const kaynakIndex = event.dataTransfer.getData('kaynakIndex');

  if (!oyuncuId) return;

  let oyuncu: Oyuncu | null = null;
  let hedefOyuncu: Oyuncu | null = null;

  const hedefTakim = takimKodu === 'A' ? takimA : takimB;
  
  // Hedef pozisyondaki mevcut oyuncuyu al
  hedefOyuncu = hedefTakim.value.oyuncular[pozisyon][hedefIndex];

  // Eğer havuzdan geliyorsa
  if (!kaynakTakim) {
    oyuncu = havuzdakiOyuncular.value.find(o => o.id === Number(oyuncuId)) || null;
    
    // Oyuncu zaten bir takımda mı kontrol et
    if (oyuncu && oyuncununTakimi(oyuncu.id)) {
      showToast('Bu oyuncu zaten bir takımda!', 'error');
      return;
    }
  } else {
    // Eğer başka bir pozisyondan geliyorsa
    const kaynakTakimObj = kaynakTakim === 'A' ? takimA : takimB;
    oyuncu = kaynakTakimObj.value.oyuncular[kaynakPozisyon][Number(kaynakIndex)];
    
    // Eski pozisyondan kaldır
    if (oyuncu) {
      delete kaynakTakimObj.value.oyuncular[kaynakPozisyon][Number(kaynakIndex)];

      // Eğer hedef pozisyonda oyuncu varsa, eski pozisyona taşı
      if (hedefOyuncu) {
        kaynakTakimObj.value.oyuncular[kaynakPozisyon][Number(kaynakIndex)] = hedefOyuncu;
      }
    }
  }

  if (!oyuncu) return;

  // Yeni pozisyona ekle
  hedefTakim.value.oyuncular[pozisyon][hedefIndex] = oyuncu;
  
  // Vurgulamaları kaldır
  removeHighlights();
  draggedPlayer.value = null;
}

const dropOnSaha = (event: DragEvent, takimKodu: 'A' | 'B') => {
  event.preventDefault();
  removeHighlights();
  draggedPlayer.value = null;
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

const siraliPozisyonlar = (pozisyonlar: { [key: string]: number }) => {
  return Object.fromEntries(
    Object.entries(pozisyonlar)
      .sort(([, a], [, b]) => b - a)
  )
}

const getPozisyonAciklama = (pozisyon: string, seviye: number) => {
  const seviyeMetni = {
    5: 'Çok İyi',
    4: 'İyi',
    3: 'Orta',
    2: 'Zayıf',
    1: 'Çok Zayıf'
  }[seviye] || 'Bilinmiyor'

  return `${pozisyon}: ${seviyeMetni}`
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // Toast gösterme fonksiyonu
  console.log(`[${type}] ${message}`)
}

onMounted(async () => {
  await Promise.all([
    oyunculariYukle(),
    gruplariYukle()
  ])
})
</script>

<style scoped>
.grid-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: linear-gradient(to bottom, #4CAF50, #2E7D32);
  height: 600px;
}

.position-area {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  gap: 15px;
  width: 100%;
  justify-content: center;
}

.position-slot {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
}

.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.position-text {
  color: rgba(255, 255, 255, 0.7);
  font-weight: bold;
  font-size: 0.8rem;
}

.player-card {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: move;
  position: relative;
}

.player-card[data-seviye="5"] {
  background: rgba(76, 175, 80, 0.9);
}

.player-card[data-seviye="4"] {
  background: rgba(139, 195, 74, 0.9);
}

.player-card[data-seviye="3"] {
  background: rgba(255, 235, 59, 0.9);
}

.player-card[data-seviye="2"] {
  background: rgba(255, 152, 0, 0.9);
}

.player-card[data-seviye="1"] {
  background: rgba(244, 67, 54, 0.9);
}

.player-avatar {
  width: 35px !important;
  height: 35px !important;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.player-name {
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 4px;
}

.forvet-area {
  flex: 1;
}

.ortasaha-area {
  flex: 1;
}

.defans-area {
  flex: 1;
}

.kaleci-area {
  flex: 1;
}

.oyuncu-havuzu {
  max-height: 500px;
  overflow-y: auto;
}

.oyuncu-listesi {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.oyuncu-karti {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: move;
}

.oyuncu-bilgi {
  flex: 1;
  min-width: 0;
}

.oyuncu-adi {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.oyuncu-pozisyonlar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.position-mini-box {
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
}

.level-5 {
  background-color: #4CAF50;
}

.level-4 {
  background-color: #8BC34A;
}

.level-3 {
  background-color: #FFEB3B;
  color: rgba(0, 0, 0, 0.87);
}

.level-2 {
  background-color: #FF9800;
}

.level-1 {
  background-color: #F44336;
}

.highlight-level-5 {
  background: rgba(76, 175, 80, 0.3) !important;
  border-color: rgba(76, 175, 80, 0.9) !important;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.highlight-level-4 {
  background: rgba(139, 195, 74, 0.3) !important;
  border-color: rgba(139, 195, 74, 0.9) !important;
  box-shadow: 0 0 15px rgba(139, 195, 74, 0.5);
}

.highlight-level-3 {
  background: rgba(255, 235, 59, 0.3) !important;
  border-color: rgba(255, 235, 59, 0.9) !important;
  box-shadow: 0 0 15px rgba(255, 235, 59, 0.5);
}

.highlight-level-2 {
  background: rgba(255, 152, 0, 0.3) !important;
  border-color: rgba(255, 152, 0, 0.9) !important;
  box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
}

.highlight-level-1 {
  background: rgba(244, 67, 54, 0.3) !important;
  border-color: rgba(244, 67, 54, 0.9) !important;
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.5);
}
</style>
