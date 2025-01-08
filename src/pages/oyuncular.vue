<template>
  <div>
    <VCard title="Oyuncular 👥">
      <VCardText>
        <VTable>
          <thead>
            <tr>
              <th>Fotoğraf</th>
              <th>Adı Soyadı</th>
              <th>Pozisyon</th>
              <th>Güç</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="oyuncu in oyuncular" :key="oyuncu.id">
              <td>
                <VAvatar size="40">
                  <VImg
                    v-if="oyuncu.resim"
                    :src="oyuncu.resim"
                    alt="Oyuncu resmi"
                  />
                  <VIcon
                    v-else
                    icon="tabler-user"
                  />
                </VAvatar>
              </td>
              <td>{{ oyuncu.adSoyad }}</td>
              <td>{{ oyuncu.pozisyon }}</td>
              <td>
                <VChip
                  :color="oyuncuGucRengi(oyuncu.guc)"
                  class="font-weight-bold"
                >
                  {{ oyuncu.guc || '-' }}
                </VChip>
              </td>
              <td>
                <VBtn
                  size="small"
                  color="primary"
                  class="me-2"
                  @click="duzenleOyuncu(oyuncu)"
                >
                  Düzenle
                </VBtn>
                <VBtn
                  size="small"
                  color="info"
                  class="me-2"
                  @click="yetenekleriDuzenle(oyuncu)"
                >
                  Yetenekler
                </VBtn>
                <VBtn
                  size="small"
                  color="error"
                  @click="silOyuncu(oyuncu.id)"
                >
                  Sil
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <VBtn
          color="success"
          class="mt-4"
          @click="yeniOyuncuDialog = true"
        >
          Yeni Oyuncu Ekle
        </VBtn>

        <!-- Yeni Oyuncu Dialog -->
        <VDialog v-model="yeniOyuncuDialog" max-width="500px">
          <VCard>
            <VCardTitle class="text-h5 pa-4 bg-primary text-white">
              <VIcon icon="tabler-user-plus" class="me-2" />
              Yeni Oyuncu Ekle
            </VCardTitle>
            <VCardText class="pa-4">
              <VForm @submit.prevent="kaydetOyuncu">
                <!-- Resim Yükleme -->
                <div class="mb-6">
                  <div class="d-flex align-center justify-center mb-2">
                    <VAvatar
                      size="120"
                      class="me-4 elevation-2"
                    >
                      <VImg
                        v-if="yeniOyuncu.resim"
                        :src="yeniOyuncu.resim"
                        alt="Oyuncu resmi"
                      />
                      <VIcon
                        v-else
                        size="48"
                        icon="tabler-user"
                      />
                    </VAvatar>
                    <VBtn
                      prepend-icon="tabler-camera"
                      color="primary"
                      variant="outlined"
                      @click="resimDialogAc('yeni')"
                    >
                      Fotoğraf Yükle
                    </VBtn>
                  </div>
                </div>

                <VTextField
                  v-model="yeniOyuncu.adSoyad"
                  label="Adı Soyadı"
                  variant="outlined"
                  prepend-inner-icon="tabler-user"
                  class="mb-4"
                  required
                />
                <VSelect
                  v-model="yeniOyuncu.pozisyon"
                  :items="pozisyonlar"
                  label="Pozisyon"
                  variant="outlined"
                  prepend-inner-icon="tabler-soccer-field"
                  class="mb-4"
                  required
                />
              </VForm>
            </VCardText>
            <VDivider />
            <VCardActions class="pa-4">
              <VSpacer />
              <VBtn
                color="error"
                variant="outlined"
                prepend-icon="tabler-x"
                @click="yeniOyuncuDialog = false"
              >
                İptal
              </VBtn>
              <VBtn
                color="success"
                prepend-icon="tabler-device-floppy"
                @click="kaydetOyuncu"
                class="ms-2"
              >
                Kaydet
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <!-- Düzenleme Dialog -->
        <VDialog v-model="duzenleDialog" max-width="500px">
          <VCard>
            <VCardTitle class="text-h5 pa-4 bg-primary text-white">
              <VIcon icon="tabler-edit" class="me-2" />
              Oyuncu Düzenle
            </VCardTitle>
            <VCardText class="pa-4">
              <VForm @submit.prevent="kaydetDuzenleme">
                <!-- Resim Yükleme -->
                <div class="mb-6">
                  <div class="d-flex align-center justify-center mb-2">
                    <VAvatar
                      size="120"
                      class="me-4 elevation-2"
                    >
                      <VImg
                        v-if="duzenleOyuncuData.resim"
                        :src="duzenleOyuncuData.resim"
                        alt="Oyuncu resmi"
                      />
                      <VIcon
                        v-else
                        size="48"
                        icon="tabler-user"
                      />
                    </VAvatar>
                    <VBtn
                      prepend-icon="tabler-camera"
                      color="primary"
                      variant="outlined"
                      @click="resimDialogAc('duzenle')"
                    >
                      Fotoğraf Yükle
                    </VBtn>
                  </div>
                </div>

                <VTextField
                  v-model="duzenleOyuncuData.adSoyad"
                  label="Adı Soyadı"
                  variant="outlined"
                  prepend-inner-icon="tabler-user"
                  class="mb-4"
                  required
                />
                <VSelect
                  v-model="duzenleOyuncuData.pozisyon"
                  :items="pozisyonlar"
                  label="Pozisyon"
                  variant="outlined"
                  prepend-inner-icon="tabler-soccer-field"
                  class="mb-4"
                  required
                />
              </VForm>
            </VCardText>
            <VDivider />
            <VCardActions class="pa-4">
              <VSpacer />
              <VBtn
                color="error"
                variant="outlined"
                prepend-icon="tabler-x"
                @click="duzenleDialog = false"
              >
                İptal
              </VBtn>
              <VBtn
                color="primary"
                prepend-icon="tabler-device-floppy"
                @click="kaydetDuzenleme"
                class="ms-2"
              >
                Güncelle
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <!-- Resim Kırpma Dialog -->
        <VDialog v-model="resimDialog" max-width="600px">
          <VCard>
            <VCardTitle>Fotoğraf Yükle</VCardTitle>
            <VCardText>
              <input
                type="file"
                accept="image/*"
                @change="resimSecildi"
                ref="resimInput"
                class="d-none"
              />
              
              <div v-if="!seciliResim" class="text-center">
                <VBtn
                  color="primary"
                  @click="$refs.resimInput.click()"
                >
                  Resim Seç
                </VBtn>
              </div>

              <div v-else>
                <Cropper
                  class="cropper"
                  :src="seciliResim"
                  :stencil-props="{
                    aspectRatio: 1
                  }"
                  @change="resimDegisti"
                />
              </div>
            </VCardText>
            <VCardActions>
              <VSpacer />
              <VBtn color="error" @click="resimDialogKapat">İptal</VBtn>
              <VBtn
                v-if="seciliResim"
                color="success"
                @click="resimKirp"
              >
                Kaydet
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <!-- Yetenekler Dialog -->
        <VDialog v-model="yeteneklerDialog" max-width="1200px">
          <VCard>
            <VCardTitle class="text-h5 pa-4 bg-info text-white">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <VAvatar size="48" class="me-3 elevation-2">
                    <VImg
                      v-if="secilenOyuncu?.resim"
                      :src="secilenOyuncu.resim"
                      alt="Oyuncu resmi"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                      size="32"
                    />
                  </VAvatar>
                  <div>
                    <VIcon icon="tabler-star" class="me-2" />
                    Oyuncu Yetenekleri - {{ secilenOyuncu?.adSoyad }}
                  </div>
                </div>
                <VChip
                  :color="oyuncuGucRengi(canliGuc)"
                  size="large"
                  class="font-weight-bold text-h6 pa-4"
                >
                  Güç: {{ canliGuc }}
                </VChip>
              </div>
            </VCardTitle>
            <VCardText class="pa-6">
              <VTabs v-model="activeTab" color="primary" grow class="mb-6">
                <VTab value="teknik" class="text-none">
                  <VIcon icon="tabler-tool" class="me-2" />
                  Teknik
                </VTab>
                <VTab value="mental" class="text-none">
                  <VIcon icon="tabler-brain" class="me-2" />
                  Mental
                </VTab>
                <VTab value="fiziksel" class="text-none">
                  <VIcon icon="tabler-run" class="me-2" />
                  Fiziksel
                </VTab>
              </VTabs>

              <VWindow v-model="activeTab">
                <VWindowItem v-for="(kategori, index) in ['teknik', 'mental', 'fiziksel']" :key="index" :value="kategori">
                  <VRow>
                    <VCol cols="6" v-for="(yetenek, i) in getKategoriYetenekleri(kategori)" :key="i">
                      <div class="yetenek-container">
                        <span class="yetenek-label">{{ yetenek.ad }}</span>
                        <div class="d-flex align-center">
                          <VBtn
                            density="compact"
                            variant="text"
                            :disabled="yetenek.deger <= 0"
                            @click="yetenek.deger = Math.max(0, Number(yetenek.deger) - 1); hesaplaCanlıGuc()"
                            class="yetenek-btn"
                          >
                            <VIcon size="20">tabler-minus</VIcon>
                          </VBtn>
                          
                          <div class="yetenek-deger" :class="yetenekDegerRengi(yetenek.deger)">
                            {{ yetenek.deger }}
                          </div>
                          
                          <VBtn
                            density="compact"
                            variant="text"
                            :disabled="yetenek.deger >= 20"
                            @click="yetenek.deger = Math.min(20, Number(yetenek.deger) + 1); hesaplaCanlıGuc()"
                            class="yetenek-btn"
                          >
                            <VIcon size="20">tabler-plus</VIcon>
                          </VBtn>
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VWindowItem>
              </VWindow>
            </VCardText>
            <VDivider />
            <VCardActions class="pa-4">
              <div class="text-body-2">
                Değerler: 
                <span class="text-error font-weight-medium">0-9 Zayıf</span> |
                <span class="text-info font-weight-medium">10-14 Orta</span> |
                <span class="text-success font-weight-medium">15-20 İyi</span>
              </div>
              <VSpacer />
              <VBtn
                color="error"
                variant="outlined"
                prepend-icon="tabler-x"
                @click="yeteneklerDialog = false"
              >
                İptal
              </VBtn>
              <VBtn
                color="success"
                prepend-icon="tabler-device-floppy"
                @click="yetenekleriKaydet"
                class="ms-2"
              >
                Kaydet
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

interface Oyuncu {
  id: number
  adSoyad: string
  pozisyon: string
  resim?: string
  yetenekler?: {
    [key: string]: number
  }
  guc?: number
}

interface Yetenek {
  ad: string
  deger: number
}

const oyuncular = ref<Oyuncu[]>([
  {
    id: 1,
    adSoyad: 'Ahmet Yılmaz',
    pozisyon: 'Forvet',
  },
  {
    id: 2,
    adSoyad: 'Mehmet Demir',
    pozisyon: 'Defans',
  },
])

const pozisyonlar = [
  'Kaleci',
  'Defans',
  'Orta Saha',
  'Forvet',
]

// Yeni oyuncu ekleme state'leri
const yeniOyuncuDialog = ref(false)
const yeniOyuncu = ref({
  adSoyad: '',
  pozisyon: '',
  resim: '',
})

// Düzenleme state'leri
const duzenleDialog = ref(false)
const duzenleOyuncuData = ref<Oyuncu>({
  id: 0,
  adSoyad: '',
  pozisyon: '',
  resim: '',
})

// Resim işleme state'leri
const resimDialog = ref(false)
const seciliResim = ref('')
const resimModu = ref<'yeni' | 'duzenle'>('yeni')
const cropperRef = ref()
const resimInput = ref()

// Yetenekler state'leri
const yeteneklerDialog = ref(false)
const secilenOyuncu = ref<Oyuncu | null>(null)
const activeTab = ref('teknik')

// Yetenekleri kategorilere ayır
const teknikYetenekler = ref<Yetenek[]>([
  { ad: 'Corners', deger: 10 },
  { ad: 'Crossing', deger: 10 },
  { ad: 'Dribbling', deger: 10 },
  { ad: 'Finishing', deger: 10 },
  { ad: 'First Touch', deger: 10 },
  { ad: 'Free Kick Taking', deger: 10 },
  { ad: 'Heading', deger: 10 },
  { ad: 'Long Shots', deger: 10 },
  { ad: 'Long Throws', deger: 10 },
  { ad: 'Marking', deger: 10 },
  { ad: 'Passing', deger: 10 },
  { ad: 'Penalty Taking', deger: 10 },
  { ad: 'Tackling', deger: 10 },
  { ad: 'Technique', deger: 10 },
])

const mentalYetenekler = ref<Yetenek[]>([
  { ad: 'Aggression', deger: 10 },
  { ad: 'Anticipation', deger: 10 },
  { ad: 'Bravery', deger: 10 },
  { ad: 'Composure', deger: 10 },
  { ad: 'Concentration', deger: 10 },
  { ad: 'Decisions', deger: 10 },
  { ad: 'Determination', deger: 10 },
  { ad: 'Flair', deger: 10 },
  { ad: 'Leadership', deger: 10 },
  { ad: 'Off The Ball', deger: 10 },
  { ad: 'Positioning', deger: 10 },
  { ad: 'Teamwork', deger: 10 },
  { ad: 'Vision', deger: 10 },
  { ad: 'Work Rate', deger: 10 },
])

const fizikselYetenekler = ref<Yetenek[]>([
  { ad: 'Acceleration', deger: 10 },
  { ad: 'Agility', deger: 10 },
  { ad: 'Balance', deger: 10 },
  { ad: 'Jumping Reach', deger: 10 },
  { ad: 'Natural Fitness', deger: 10 },
  { ad: 'Pace', deger: 10 },
  { ad: 'Stamina', deger: 10 },
  { ad: 'Strength', deger: 10 },
])

// Canlı güç state'i
const canliGuc = ref(0)

// Canlı güç hesaplama fonksiyonu
const hesaplaCanlıGuc = () => {
  if (!secilenOyuncu.value) return

  const yeteneklerObj: { [key: string]: number } = {}
  ;[...teknikYetenekler.value, ...mentalYetenekler.value, ...fizikselYetenekler.value].forEach(yetenek => {
    yeteneklerObj[yetenek.ad] = Number(yetenek.deger)
  })

  canliGuc.value = hesaplaOyuncuGucu(yeteneklerObj, secilenOyuncu.value.pozisyon)
}

// Yetenek değiştiğinde güç hesapla
const validateInput = (yetenek: Yetenek) => {
  let value = Number(yetenek.deger)
  if (value < 0) yetenek.deger = 0
  if (value > 20) yetenek.deger = 20
  hesaplaCanlıGuc()
}

// Yetenekler dialogu açıldığında güç hesapla
const yetenekleriDuzenle = (oyuncu: Oyuncu) => {
  secilenOyuncu.value = oyuncu
  
  // Tüm yetenekleri sıfırla ve varsayılan değer olarak 10 ata
  teknikYetenekler.value.forEach(yetenek => {
    yetenek.deger = oyuncu.yetenekler?.[yetenek.ad] ?? 10
  })
  
  mentalYetenekler.value.forEach(yetenek => {
    yetenek.deger = oyuncu.yetenekler?.[yetenek.ad] ?? 10
  })
  
  fizikselYetenekler.value.forEach(yetenek => {
    yetenek.deger = oyuncu.yetenekler?.[yetenek.ad] ?? 10
  })
  
  yeteneklerDialog.value = true
  hesaplaCanlıGuc()
}

const kaydetOyuncu = () => {
  const yeteneklerObj: { [key: string]: number } = {}
  
  // Tüm yetenekleri 10 olarak ayarla
  ;[...teknikYetenekler.value, ...mentalYetenekler.value, ...fizikselYetenekler.value].forEach(yetenek => {
    yeteneklerObj[yetenek.ad] = 10
  })
  
  oyuncular.value.push({
    id: oyuncular.value.length + 1,
    ...yeniOyuncu.value,
    yetenekler: yeteneklerObj,
    guc: hesaplaOyuncuGucu(yeteneklerObj, yeniOyuncu.value.pozisyon),
  })
  
  yeniOyuncuDialog.value = false
  yeniOyuncu.value = {
    adSoyad: '',
    pozisyon: '',
    resim: '',
  }
}

const duzenleOyuncu = (oyuncu: Oyuncu) => {
  duzenleOyuncuData.value = { ...oyuncu }
  duzenleDialog.value = true
}

const kaydetDuzenleme = () => {
  const index = oyuncular.value.findIndex(o => o.id === duzenleOyuncuData.value.id)
  if (index !== -1) {
    oyuncular.value[index] = { ...duzenleOyuncuData.value }
  }
  duzenleDialog.value = false
}

const silOyuncu = (id: number) => {
  const index = oyuncular.value.findIndex(o => o.id === id)
  if (index !== -1) {
    oyuncular.value.splice(index, 1)
  }
}

const yetenekleriKaydet = () => {
  if (secilenOyuncu.value) {
    const yeteneklerObj: { [key: string]: number } = {}
    
    // Tüm kategorilerdeki yetenekleri birleştir
    ;[...teknikYetenekler.value, ...mentalYetenekler.value, ...fizikselYetenekler.value].forEach(yetenek => {
      yeteneklerObj[yetenek.ad] = Number(yetenek.deger)
    })
    
    const index = oyuncular.value.findIndex(o => o.id === secilenOyuncu.value?.id)
    if (index !== -1) {
      const guc = hesaplaOyuncuGucu(yeteneklerObj, secilenOyuncu.value.pozisyon)
      oyuncular.value[index] = {
        ...oyuncular.value[index],
        yetenekler: yeteneklerObj,
        guc: guc,
      }
    }
  }
  
  yeteneklerDialog.value = false
}

// Güç rengi belirleme fonksiyonu
const oyuncuGucRengi = (guc?: number) => {
  if (!guc) return 'default'
  if (guc >= 80) return 'success'
  if (guc >= 60) return 'info'
  return 'error'
}

// Güç hesaplama fonksiyonu
const hesaplaOyuncuGucu = (yetenekler: { [key: string]: number }, pozisyon: string) => {
  let toplamPuan = 0
  let toplamKatsayi = 0

  const katsayilar: { [key: string]: { [key: string]: number } } = {
    'Defans': {
      'Dribbling': 2,
      'First Touch': 3,
      'Heading': 4,
      'Marking': 5,
      'Passing': 4,
      'Tackling': 5,
      'Technique': 2,
      'Aggression': 4,
      'Anticipation': 4,
      'Bravery': 3,
      'Composure': 4,
      'Concentration': 3,
      'Decisions': 4,
      'Positioning': 5,
      'Acceleration': 3,
      'Agility': 4,
      'Jumping Reach': 4,
      'Pace': 4,
      'Strength': 4,
      'Stamina': 4,
    },
    'Orta Saha': {
      'Corners': 2,
      'Dribbling': 3,
      'Finishing': 3,
      'First Touch': 4,
      'Free Kick Taking': 2,
      'Long Shots': 4,
      'Marking': 2,
      'Passing': 5,
      'Tackling': 3,
      'Technique': 5,
      'Aggression': 3,
      'Decisions': 4,
      'Off The Ball': 5,
      'Positioning': 4,
      'Vision': 4,
      'Acceleration': 4,
      'Agility': 3,
      'Balance': 3,
      'Pace': 3,
      'Stamina': 5,
      'Strength': 4,
    },
    'Forvet': {
      'Dribbling': 4,
      'Finishing': 5,
      'First Touch': 3,
      'Passing': 3,
      'Technique': 3,
      'Decisions': 4,
      'Off The Ball': 5,
      'Pace': 4,
      'Acceleration': 5,
      'Agility': 5,
      'Balance': 3,
      'Jumping Reach': 3,
      'Strength': 4,
    }
  }

  const pozisyonKatsayilari = katsayilar[pozisyon] || {}
  
  Object.entries(yetenekler).forEach(([yetenek, deger]) => {
    const katsayi = pozisyonKatsayilari[yetenek] || (pozisyon === 'Forvet' ? 2 : 1)
    toplamPuan += deger * katsayi
    toplamKatsayi += katsayi
  })

  // 1-99 arası güç puanı hesapla
  const guc = Math.round((toplamPuan / toplamKatsayi) * 4.95) // 20 üzerinden olan puanı 99'a ölçekle
  return Math.min(99, Math.max(1, guc))
}

const yetenekRengi = (deger: number) => {
  if (deger >= 15) return 'success'
  if (deger >= 10) return 'info'
  return 'error'
}

const getKategoriYetenekleri = (kategori: string) => {
  switch (kategori) {
    case 'teknik':
      return teknikYetenekler.value
    case 'mental':
      return mentalYetenekler.value
    case 'fiziksel':
      return fizikselYetenekler.value
    default:
      return []
  }
}

const yetenekDegerRengi = (deger: number) => {
  if (deger >= 15) return 'success-value'
  if (deger >= 10) return 'warning-value'
  return 'error-value'
}
</script>

<style scoped>
.cropper {
  height: 400px;
  background: #DDD;
}

.yetenek-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

.yetenek-container:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.yetenek-label {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  flex: 1;
}

.yetenek-deger {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 4px;
  margin: 0 8px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.yetenek-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 4px !important;
}

.yetenek-btn:hover {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.success-value {
  color: #2E7D32 !important;
  background-color: #E8F5E9 !important;
  border-color: #A5D6A7 !important;
}

.warning-value {
  color: #F57C00 !important;
  background-color: #FFF3E0 !important;
  border-color: #FFCC80 !important;
}

.error-value {
  color: #C62828 !important;
  background-color: #FFEBEE !important;
  border-color: #EF9A9A !important;
}
</style> 
