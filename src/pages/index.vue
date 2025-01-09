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
                    <div class="oyuncu-guc">
                      <VChip
                        :color="oyuncuGucRengi(oyuncu.guc)"
                        class="font-weight-bold"
                      >
                        {{ oyuncu.guc || '-' }}
                  </VChip>
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
              <div class="position-area forvet-area" 
                   @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 4" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', 'ST', i-1)">
                    <div v-if="takimA.oyuncular.ST[i-1]" 
                         class="player-card"
                         :data-guc="getGucSeviyesi(takimA.oyuncular.ST[i-1].guc)"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', 'ST', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular.ST[i-1].resim" :src="takimA.oyuncular.ST[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <div class="player-power">{{ takimA.oyuncular.ST[i-1].guc }}</div>
                      <span class="player-name">{{ takimA.oyuncular.ST[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">+</div>
                  </div>
                </div>
              </div>
              <div class="position-area ortasaha-area"
                   @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 12" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', 'CM', i-1)">
                    <div v-if="takimA.oyuncular.CM[i-1]" 
                         class="player-card"
                         :data-guc="getGucSeviyesi(takimA.oyuncular.CM[i-1].guc)"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', 'CM', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular.CM[i-1].resim" :src="takimA.oyuncular.CM[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <div class="player-power">{{ takimA.oyuncular.CM[i-1].guc }}</div>
                      <span class="player-name">{{ takimA.oyuncular.CM[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">+</div>
                  </div>
                </div>
              </div>
              <div class="position-area defans-area"
                   @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 4" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'A', 'DC', i-1)">
                    <div v-if="takimA.oyuncular.DC[i-1]" 
                         class="player-card"
                         :data-guc="getGucSeviyesi(takimA.oyuncular.DC[i-1].guc)"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'A', 'DC', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimA.oyuncular.DC[i-1].resim" :src="takimA.oyuncular.DC[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <div class="player-power">{{ takimA.oyuncular.DC[i-1].guc }}</div>
                      <span class="player-name">{{ takimA.oyuncular.DC[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">+</div>
                  </div>
                </div>
              </div>
              <div class="position-area kaleci-area"
                   @dragover.prevent
                   @drop="dropOnArea($event, 'A', 'GK', 0)">
                <!-- Kaleci -->
                <div v-for="(oyuncu, index) in takimA.oyuncular.GK" 
                     :key="index"
                     class="player-card"
                     :data-guc="getGucSeviyesi(oyuncu.guc)"
                     draggable="true"
                     @dragstart="dragStartPozisyon($event, 'A', 'GK', index)">
                  <VAvatar size="40" class="player-avatar">
                    <VImg v-if="oyuncu.resim" :src="oyuncu.resim" />
                    <VIcon v-else icon="tabler-user" />
                  </VAvatar>
                  <div class="player-power">{{ oyuncu.guc }}</div>
                  <span class="player-name">{{ oyuncu.adSoyad }}</span>
                </div>
              </div>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard height="600" class="grid-card">
              <!-- B Takımı için aynı yapı -->
              <div class="position-area forvet-area"
                   @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 4" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'B', 'ST', i-1)">
                    <div v-if="takimB.oyuncular.ST[i-1]" 
                         class="player-card"
                         :data-guc="getGucSeviyesi(takimB.oyuncular.ST[i-1].guc)"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'B', 'ST', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimB.oyuncular.ST[i-1].resim" :src="takimB.oyuncular.ST[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <div class="player-power">{{ takimB.oyuncular.ST[i-1].guc }}</div>
                      <span class="player-name">{{ takimB.oyuncular.ST[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">+</div>
                  </div>
                </div>
              </div>
              <div class="position-area ortasaha-area"
                   @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 12" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'B', 'CM', i-1)">
                    <div v-if="takimB.oyuncular.CM[i-1]" 
                         class="player-card"
                         :data-guc="getGucSeviyesi(takimB.oyuncular.CM[i-1].guc)"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'B', 'CM', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimB.oyuncular.CM[i-1].resim" :src="takimB.oyuncular.CM[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <div class="player-power">{{ takimB.oyuncular.CM[i-1].guc }}</div>
                      <span class="player-name">{{ takimB.oyuncular.CM[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">+</div>
                  </div>
                </div>
              </div>
              <div class="position-area defans-area"
                   @dragover.prevent>
                <div class="position-grid">
                  <div v-for="i in 4" :key="i" class="position-slot"
                       @dragover.prevent
                       @drop="dropOnArea($event, 'B', 'DC', i-1)">
                    <div v-if="takimB.oyuncular.DC[i-1]" 
                         class="player-card"
                         :data-guc="getGucSeviyesi(takimB.oyuncular.DC[i-1].guc)"
                         draggable="true"
                         @dragstart="dragStartPozisyon($event, 'B', 'DC', i-1)">
                      <VAvatar size="40" class="player-avatar">
                        <VImg v-if="takimB.oyuncular.DC[i-1].resim" :src="takimB.oyuncular.DC[i-1].resim" />
                        <VIcon v-else icon="tabler-user" />
                      </VAvatar>
                      <div class="player-power">{{ takimB.oyuncular.DC[i-1].guc }}</div>
                      <span class="player-name">{{ takimB.oyuncular.DC[i-1].adSoyad }}</span>
                    </div>
                    <div v-else class="empty-slot">+</div>
                  </div>
                </div>
              </div>
              <div class="position-area kaleci-area"
                   @dragover.prevent
                   @drop="dropOnArea($event, 'B', 'GK', 0)">
                <!-- Kaleci -->
                <div v-for="(oyuncu, index) in takimB.oyuncular.GK" 
                     :key="index"
                     class="player-card"
                     :data-guc="getGucSeviyesi(oyuncu.guc)"
                     draggable="true"
                     @dragstart="dragStartPozisyon($event, 'B', 'GK', index)">
                  <VAvatar size="40" class="player-avatar">
                    <VImg v-if="oyuncu.resim" :src="oyuncu.resim" />
                    <VIcon v-else icon="tabler-user" />
                  </VAvatar>
                  <div class="player-power">{{ oyuncu.guc }}</div>
                  <span class="player-name">{{ oyuncu.adSoyad }}</span>
                </div>
              </div>
            </VCard>
          </VCol>
        </VRow>
      </VCol>
    </VRow>

    <!-- Toast Bildirimleri -->
    <VSnackbar
      v-model="toast.show"
      :color="toast.color"
      :timeout="3000"
      location="top"
    >
      {{ toast.message }}
      
      <template v-slot:actions>
        <VBtn
          color="white"
          variant="text"
          @click="toast.show = false"
        >
          Kapat
        </VBtn>
      </template>
    </VSnackbar>

    <!-- Grup Yönetimi Dialog -->
    <VDialog v-model="grupDialog" max-width="500">
      <VCard>
        <VCardTitle>Grup Yönetimi</VCardTitle>
        <VCardText>
          <VForm @submit.prevent="yeniGrupEkle" class="mb-4">
            <div class="d-flex gap-2">
          <VTextField
                v-model="yeniGrup.isim"
                label="Yeni Grup İsmi"
            variant="outlined"
                density="compact"
                hide-details
              />
              <VBtn
                color="success"
                type="submit"
                :disabled="!yeniGrup.isim"
              >
                Ekle
              </VBtn>
          </div>
          </VForm>

          <VList lines="two">
            <VListItem
              v-for="grup in gruplar"
              :key="grup.id"
              :value="grup.id"
            >
              <template v-slot:prepend>
                <VIcon icon="tabler-users" />
              </template>
              
              <VListItemTitle>
                <div class="d-flex align-center justify-space-between">
                  <div v-if="!grup.duzenleniyor">{{ grup.isim }}</div>
              <VTextField
                    v-else
                    v-model="grup.yeniIsim"
                variant="outlined"
                density="compact"
                    hide-details
                    autofocus
                    @keyup.enter="grupIsmiKaydet(grup)"
                    @blur="grupIsmiKaydet(grup)"
                  />
                  <div class="d-flex gap-2">
                    <VBtn
                      v-if="!grup.duzenleniyor"
                      icon="tabler-edit"
                      size="small"
                      variant="text"
                      @click="grupDuzenle(grup)"
                    />
                    <VBtn
                      icon="tabler-trash"
                      size="small"
                      color="error"
                      variant="text"
                      @click="grupSil(grup.id)"
              />
            </div>
            </div>
              </VListItemTitle>
              
              <VListItemSubtitle>
                {{ grup.oyuncuSayisi }} oyuncu
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn 
            color="primary" 
            @click="grupDialog = false"
          >
            Kapat
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
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
  guc?: number;
  pozisyonlar?: Pozisyonlar;
  gruplar?: Grup[];
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
      ...o,
      pozisyonlar: {
        GK: o.pozisyonlar?.GK || 1,
        ST: o.pozisyonlar?.ST,
        LW: o.pozisyonlar?.LW,
        OOS: o.pozisyonlar?.OOS,
        RW: o.pozisyonlar?.RW,
        CM: o.pozisyonlar?.CM,
        DM: o.pozisyonlar?.DM,
        DL: o.pozisyonlar?.DL,
        DC: o.pozisyonlar?.DC,
        DR: o.pozisyonlar?.DR
      }
    }))
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

const dropOnArea = (event: DragEvent, takimKodu: 'A' | 'B', pozisyon: string, hedefIndex: number) => {
  event.preventDefault();
  const oyuncuId = event.dataTransfer?.getData('oyuncuId');
  const kaynakTakim = event.dataTransfer?.getData('kaynakTakim') as 'A' | 'B';
  const kaynakPozisyon = event.dataTransfer?.getData('kaynakPozisyon');
  const kaynakIndex = event.dataTransfer?.getData('kaynakIndex');

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
      showToast('Bu oyuncu zaten bir takımda!', 'error')
      return
    }
  } else {
    // Eğer başka bir pozisyondan geliyorsa
    const kaynakTakimObj = kaynakTakim === 'A' ? takimA : takimB;
    oyuncu = kaynakTakimObj.value.oyuncular[kaynakPozisyon!][Number(kaynakIndex)];
    
      // Eski pozisyondan kaldır
    if (oyuncu) {
      delete kaynakTakimObj.value.oyuncular[kaynakPozisyon!][Number(kaynakIndex)];

      // Eğer hedef pozisyonda oyuncu varsa, eski pozisyona taşı
      if (hedefOyuncu) {
        kaynakTakimObj.value.oyuncular[kaynakPozisyon!][Number(kaynakIndex)] = hedefOyuncu;
      }
    }
  }

  if (!oyuncu) return;

  // Yeni pozisyona ekle
  hedefTakim.value.oyuncular[pozisyon][hedefIndex] = oyuncu;
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

  showToast('Takımlar sıfırlandı', 'success')
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
    const response = await fetch('http://localhost:3000/api/pozisyonlar')
    const data = await response.json()
    pozisyonlar.value = data
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

// Toast bildirimi için state
const toast = ref({
  show: false,
  message: '',
  color: 'success'
})

// Toast gösterme fonksiyonu
const showToast = (message: string, color: 'success' | 'error' | 'warning' = 'success') => {
  toast.value = {
    show: true,
    message,
    color
  }
}

const getGucSeviyesi = (guc?: number) => {
  if (!guc) return 'dusuk'
  if (guc < 65) return 'dusuk'
  if (guc < 75) return 'orta'
  if (guc < 85) return 'iyi'
  return 'mukemmel'
}

const grupDialog = ref(false)
const gruplar = ref<Grup[]>([])
const yeniGrup = ref({
  isim: ''
})

// Grupları yükle
const gruplariYukle = async () => {
  try {
    gruplar.value = await api.getGruplar()
  } catch (error) {
    console.error('Gruplar yüklenirken hata:', error)
  }
}

// Yeni grup ekle
const yeniGrupEkle = async () => {
  try {
    if (!yeniGrup.value.isim) return

    await api.createGrup({
      isim: yeniGrup.value.isim
    })

    yeniGrup.value.isim = ''
    await gruplariYukle()
    showToast('Grup başarıyla eklendi', 'success')
  } catch (error) {
    console.error('Grup eklenirken hata:', error)
    showToast('Grup eklenirken bir hata oluştu', 'error')
  }
}

// Grup düzenle
const grupDuzenle = (grup: Grup) => {
  grup.duzenleniyor = true
  grup.yeniIsim = grup.isim
}

// Grup ismini kaydet
const grupIsmiKaydet = async (grup: Grup) => {
  try {
    if (!grup.yeniIsim || grup.yeniIsim === grup.isim) {
      grup.duzenleniyor = false
      return
    }

    await api.updateGrup(grup.id, {
      isim: grup.yeniIsim
    })

    grup.isim = grup.yeniIsim
    grup.duzenleniyor = false
    showToast('Grup ismi güncellendi', 'success')
  } catch (error) {
    console.error('Grup güncellenirken hata:', error)
    showToast('Grup güncellenirken bir hata oluştu', 'error')
  }
}

// Grup sil
const grupSil = async (grupId: number) => {
  try {
    await api.deleteGrup(grupId)
    await gruplariYukle()
    showToast('Grup başarıyla silindi', 'success')
  } catch (error) {
    console.error('Grup silinirken hata:', error)
    showToast('Grup silinirken bir hata oluştu', 'error')
  }
}

// Script kısmına computed property ekle
const seciliGruplarText = computed(() => {
  return gruplar.value
    .filter(grup => seciliGruplar.value.includes(grup.id))
    .map(grup => grup.isim)
    .join(', ')
})

onMounted(() => {
  oyunculariYukle()
  pozisyonlariYukle()
  gruplariYukle()
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

.grid-card {
  background-image: 
    linear-gradient(to bottom,
      #FF4500 15%, /* Turuncu - Forvet */
      #FFD700 15%, 60%, /* Sarı - Orta Saha (3 kat daha büyük) */
      #0000FF 60%, 80%, /* Mavi - Defans */
      #FF0000 80% /* Kırmızı - Kaleci */
    );
  color: white;
  position: relative;
  overflow: hidden;
}

.position-area {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}

.forvet-area {
  height: 15%;
  top: 0;
}

.ortasaha-area {
  height: 45%;
  top: 15%;
}

.defans-area {
  height: 20%;
  top: 60%;
}

.kaleci-area {
  height: 20%;
  top: 80%;
}

.player-card {
  width: 100%;
  max-width: 70px;
  min-height: 85px;
  position: relative;
  cursor: move;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;
}

.player-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 65px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  clip-path: polygon(
    /* Sol Kol */
    0 20%,        /* Sol omuz başlangıç */
    20% 20%,      /* Sol omuz iç */
    /* Yaka */
    33% 0,        /* Sol yaka */
    50% 15%,      /* Yaka V noktası */
    67% 0,        /* Sağ yaka */
    /* Sağ Kol */
    80% 20%,      /* Sağ omuz iç */
    100% 20%,     /* Sağ omuz başlangıç */
    100% 45%,     /* Sağ kol uç */
    85% 45%,      /* Sağ kol iç */
    /* Gövde */
    85% 100%,     /* Sağ alt */
    15% 100%,     /* Sol alt */
    /* Sol Kol devamı */
    15% 45%,      /* Sol kol iç */
    0 45%         /* Sol kol uç */
  );
  z-index: -1;
}

.player-power {
  position: absolute;
  top: 0;
  right: -5px;
  transform: none;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  z-index: 2;
  padding: 2px 6px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Güç seviyelerine göre renkler */
.player-card[data-guc="dusuk"] .player-power {
  background: #dc3545; /* Kırmızı */
  border: 2px solid #dc3545;
}

.player-card[data-guc="orta"] .player-power {
  background: #ffc107; /* Sarı */
  border: 2px solid #ffc107;
  color: #333; /* Sarı arka plan için koyu yazı */
}

.player-card[data-guc="iyi"] .player-power {
  background: #28a745; /* Yeşil */
  border: 2px solid #28a745;
}

.player-card[data-guc="mukemmel"] .player-power {
  background: #0a4b9e; /* Koyu Mavi */
  border: 2px solid #0a4b9e;
}

.player-avatar {
  width: 35px !important;
  height: 35px !important;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 1;
  margin-top: 8px;
}

.player-name {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.7rem;
  line-height: 1;
  font-weight: bold;
  color: #333;
  text-shadow: none;
  text-align: center;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 3px;
}

.player-card:hover::before {
  filter: brightness(0.98);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  width: 100%;
  height: 100%;
  padding: 4px;
}

/* Orta saha için özel grid */
.ortasaha-area .position-grid {
  grid-template-rows: repeat(3, 1fr);
}

/* Diğer alanlar için tek satır */
.forvet-area .position-grid,
.defans-area .position-grid {
  grid-template-rows: 1fr;
}

.position-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85px;
  padding: 2px;
}

.empty-slot {
  width: 35px;
  height: 35px;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
}

.empty-slot:hover {
  border-color: rgba(255, 255, 255, 0.8);
  color: white;
}

.oyuncu-havuzu {
  margin-top: 1rem;
}

.oyuncu-listesi {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.oyuncu-karti {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s ease;
}

.oyuncu-karti:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}

.oyuncu-bilgi {
  flex: 1;
}

.oyuncu-adi {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.oyuncu-pozisyonlar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.position-mini-box {
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
  min-width: 32px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.level-1 { background-color: white; color: #333; text-shadow: none; }
.level-2 { background-color: #ffd700; color: #333; } /* Sarı - Kötü */
.level-3 { background-color: #ff9800; color: white; } /* Turuncu - Ortalama */
.level-4 { background-color: #2e7d32; color: white; } /* Koyu Yeşil - İyi */
.level-5 { background-color: #66bb6a; color: white; } /* Açık Yeşil - Çok İyi */

@media (max-width: 600px) {
  .oyuncu-listesi {
    grid-template-columns: 1fr;
  }

  .position-mini-box {
    font-size: 0.7rem;
    padding: 1px 3px;
    min-width: 28px;
  }
}
</style>
