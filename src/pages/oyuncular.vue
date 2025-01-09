<template>
  <div>
    <VCard title="Oyuncular 👥">
      <VCardText>
        <VBtn
          color="success"
          class="mb-4"
          @click="yeniOyuncuDialog = true"
        >
          Yeni Oyuncu Ekle
        </VBtn>

        <VTable class="oyuncular-table">
          <thead>
            <tr>
              <th class="d-none d-sm-table-cell">Fotoğraf</th>
              <th>Adı Soyadı</th>
              <th>Pozisyonlar</th>
              <th>Güç</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="oyuncu in oyuncular" :key="oyuncu.id">
              <td class="d-none d-sm-table-cell">
                <VAvatar size="40">
                  <VImg
                    v-if="oyuncu.resim"
                    :src="oyuncu.resim"
                    alt="Oyuncu resmi"
                  />
                  <VIcon v-else icon="tabler-user" />
                </VAvatar>
              </td>
              <td>
                <div class="d-flex align-center">
                  <VAvatar size="32" class="d-sm-none me-2">
                    <VImg
                      v-if="oyuncu.resim"
                      :src="oyuncu.resim"
                      alt="Oyuncu resmi"
                    />
                    <VIcon v-else icon="tabler-user" />
                  </VAvatar>
                  {{ oyuncu.adSoyad }}
                </div>
              </td>
              <td>
                <div class="positions-preview">
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
              </td>
              <td>
                <VChip
                  :color="oyuncuGucRengi(oyuncu.guc)"
                  class="font-weight-bold"
                >
                  {{ oyuncu.guc || '-' }}
                </VChip>
              </td>
              <td>
                <div class="d-flex flex-wrap gap-2">
                  <VBtn
                    size="small"
                    color="primary"
                    class="flex-grow-0"
                    @click="duzenleOyuncu(oyuncu)"
                  >
                    <VIcon size="small" icon="tabler-edit" class="d-sm-none" />
                    <span class="d-none d-sm-block">Düzenle</span>
                  </VBtn>
                  <VBtn
                    size="small"
                    color="info"
                    class="flex-grow-0"
                    @click="yetenekleriDuzenle(oyuncu)"
                  >
                    <VIcon size="small" icon="tabler-star" class="d-sm-none" />
                    <span class="d-none d-sm-block">Yetenekler</span>
                  </VBtn>
                  <VBtn
                    size="small"
                    color="error"
                    class="flex-grow-0"
                    @click="silOyuncu(oyuncu.id)"
                  >
                    <VIcon size="small" icon="tabler-trash" class="d-sm-none" />
                    <span class="d-none d-sm-block">Sil</span>
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

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

                <!-- Pozisyon Seviyeleri -->
                <div class="position-selector mb-4">
                  <div class="text-h6 mb-2">Pozisyon Seviyeleri</div>
                  <div class="football-field">
                    <!-- Forvet Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getPosClass('ST')"
                           @click="togglePosition('ST')">
                        ST
                      </div>
                    </div>
                    <!-- Ofansif Orta Saha Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getPosClass('LW')"
                           @click="togglePosition('LW')">
                        LW
                      </div>
                      <div class="position-box"
                           :class="getPosClass('OOS')"
                           @click="togglePosition('OOS')">
                        OOS
                      </div>
                      <div class="position-box"
                           :class="getPosClass('RW')"
                           @click="togglePosition('RW')">
                        RW
                      </div>
                    </div>
                    <!-- Orta Saha Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getPosClass('CM')"
                           @click="togglePosition('CM')">
                        CM
                      </div>
                    </div>
                    <!-- Defansif Orta Saha Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getPosClass('DM')"
                           @click="togglePosition('DM')">
                        DM
                      </div>
                    </div>
                    <!-- Defans Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getPosClass('DL')"
                           @click="togglePosition('DL')">
                        DL
                      </div>
                      <div class="position-box"
                           :class="getPosClass('DC')"
                           @click="togglePosition('DC')">
                        DC
                      </div>
                      <div class="position-box"
                           :class="getPosClass('DR')"
                           @click="togglePosition('DR')">
                        DR
                      </div>
                    </div>
                    <!-- Kaleci -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getPosClass('GK')"
                           @click="togglePosition('GK')">
                        GK
                      </div>
                    </div>
                  </div>
                  <div class="position-legend mt-2">
                    <div class="legend-item">
                      <div class="legend-box level-5"></div>
                      <span>Çok İyi</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-4"></div>
                      <span>İyi</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-3"></div>
                      <span>Ortalama</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-2"></div>
                      <span>Kötü</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-1"></div>
                      <span>Çok Kötü</span>
                    </div>
                  </div>
                </div>
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

                <!-- Pozisyon Seviyeleri -->
                <div class="position-selector mb-4">
                  <div class="text-h6 mb-2">Pozisyon Seviyeleri</div>
                  <div class="football-field">
                    <!-- Forvet Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getDuzenleClass('ST')"
                           @click="toggleDuzenlePosition('ST')">
                        ST
                      </div>
                    </div>
                    <!-- Ofansif Orta Saha Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getDuzenleClass('LW')"
                           @click="toggleDuzenlePosition('LW')">
                        LW
                      </div>
                      <div class="position-box"
                           :class="getDuzenleClass('OOS')"
                           @click="toggleDuzenlePosition('OOS')">
                        OOS
                      </div>
                      <div class="position-box"
                           :class="getDuzenleClass('RW')"
                           @click="toggleDuzenlePosition('RW')">
                        RW
                      </div>
                    </div>
                    <!-- Orta Saha Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getDuzenleClass('CM')"
                           @click="toggleDuzenlePosition('CM')">
                        CM
                      </div>
                    </div>
                    <!-- Defansif Orta Saha Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getDuzenleClass('DM')"
                           @click="toggleDuzenlePosition('DM')">
                        DM
                      </div>
                    </div>
                    <!-- Defans Hattı -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getDuzenleClass('DL')"
                           @click="toggleDuzenlePosition('DL')">
                        DL
                      </div>
                      <div class="position-box"
                           :class="getDuzenleClass('DC')"
                           @click="toggleDuzenlePosition('DC')">
                        DC
                      </div>
                      <div class="position-box"
                           :class="getDuzenleClass('DR')"
                           @click="toggleDuzenlePosition('DR')">
                        DR
                      </div>
                    </div>
                    <!-- Kaleci -->
                    <div class="position-row">
                      <div class="position-box"
                           :class="getDuzenleClass('GK')"
                           @click="toggleDuzenlePosition('GK')">
                        GK
                      </div>
                    </div>
                  </div>
                  <div class="position-legend mt-2">
                    <div class="legend-item">
                      <div class="legend-box level-5"></div>
                      <span>Çok İyi</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-4"></div>
                      <span>İyi</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-3"></div>
                      <span>Ortalama</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-2"></div>
                      <span>Kötü</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-box level-1"></div>
                      <span>Çok Kötü</span>
                    </div>
                  </div>
                </div>
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
        <VDialog v-model="yeteneklerDialog" :max-width="$vuetify.display.mdAndUp ? '1200px' : '100%'" :fullscreen="$vuetify.display.smAndDown">
          <VCard>
            <VCardTitle class="text-h5 pa-4 bg-white">
              <div class="d-flex align-center justify-space-between flex-wrap gap-4">
                <div class="d-flex align-center">
                  <VAvatar :size="$vuetify.display.smAndDown ? 40 : 48" class="me-3 elevation-2">
                    <VImg
                      v-if="secilenOyuncu?.resim"
                      :src="secilenOyuncu.resim"
                      alt="Oyuncu resmi"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                      :size="$vuetify.display.smAndDown ? 24 : 32"
                    />
                  </VAvatar>
                  <div class="text-truncate text-black">
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
            <VCardText :class="$vuetify.display.smAndDown ? 'pa-2' : 'pa-6'">
              <VTabs v-model="activeTab" color="primary" grow class="mb-6">
                <VTab value="teknik" class="text-none">
                  <VIcon icon="tabler-tool" class="me-2" />
                  <span class="d-none d-sm-block">Teknik</span>
                </VTab>
                <VTab value="mental" class="text-none">
                  <VIcon icon="tabler-brain" class="me-2" />
                  <span class="d-none d-sm-block">Mental</span>
                </VTab>
                <VTab value="fiziksel" class="text-none">
                  <VIcon icon="tabler-run" class="me-2" />
                  <span class="d-none d-sm-block">Fiziksel</span>
                </VTab>
              </VTabs>

              <VWindow v-model="activeTab">
                <VWindowItem v-for="(kategori, index) in ['teknik', 'mental', 'fiziksel']" :key="index" :value="kategori">
                  <VRow>
                    <VCol :cols="$vuetify.display.smAndDown ? 12 : 6" v-for="(yetenek, i) in getKategoriYetenekleri(kategori)" :key="i">
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
                            <VIcon :size="$vuetify.display.smAndDown ? 16 : 20">tabler-minus</VIcon>
                          </VBtn>
                          
                          <div class="yetenek-deger" :class="yetenekDegerRengi(yetenek.deger)">
                            <VTextField
                              v-model="yetenek.deger"
                              type="number"
                              min="0"
                              max="20"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="yetenek-input"
                              style="width: 40px"
                              @input="validateInput(yetenek)"
                            />
                          </div>
                          
                          <VBtn
                            density="compact"
                            variant="text"
                            :disabled="yetenek.deger >= 20"
                            @click="yetenek.deger = Math.min(20, Number(yetenek.deger) + 1); hesaplaCanlıGuc()"
                            class="yetenek-btn"
                          >
                            <VIcon :size="$vuetify.display.smAndDown ? 16 : 20">tabler-plus</VIcon>
                          </VBtn>
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VWindowItem>
              </VWindow>
            </VCardText>
            <VDivider />
            <VCardActions :class="$vuetify.display.smAndDown ? 'pa-2 flex-wrap gap-2' : 'pa-4'">
              <div class="text-body-2 d-none d-sm-block">
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
                :block="$vuetify.display.smAndDown"
              >
                İptal
              </VBtn>
              <VBtn
                color="success"
                prepend-icon="tabler-device-floppy"
                @click="yetenekleriKaydet"
                :class="$vuetify.display.smAndDown ? 'mt-2' : 'ms-2'"
                :block="$vuetify.display.smAndDown"
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
import api from '@/services/api'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

interface Oyuncu {
  id: number
  adSoyad: string
  resim?: string
  yetenekler?: {
    [key: string]: number
  }
  pozisyonlar?: {
    ST: number;
    OOS: number;
    RW: number;
    LW: number;
    CM: number;
    DM: number;
    DC: number;
    DR: number;
    DL: number;
    GK: number;
  }
  guc?: number
}

interface Yetenek {
  ad: string
  deger: number
}

const oyuncular = ref<Oyuncu[]>([])

// Oyuncuları yükle
const oyunculariYukle = async () => {
  try {
    oyuncular.value = await api.getOyuncular()
  } catch (error) {
    console.error('Oyuncular yüklenirken hata oluştu:', error)
  }
}

// Component yüklendiğinde oyuncuları getir
onMounted(() => {
  oyunculariYukle()
})

const pozisyonlar = [
  'Kaleci',
  'Defans',
  'Orta Saha',
  'Forvet',
]

// Yeni oyuncu ekleme state'leri
const yeniOyuncuDialog = ref(false)

interface Pozisyonlar {
  ST: number;
  OOS: number;
  RW: number;
  LW: number;
  CM: number;
  DM: number;
  DC: number;
  DR: number;
  DL: number;
  GK: number;
}

type PozisyonKodu = keyof Pozisyonlar;

interface YeniOyuncu {
  adSoyad: string;
  resim: string | null;
  pozisyonlar: Pozisyonlar;
}

const yeniOyuncu = ref<YeniOyuncu>({
  adSoyad: '',
  resim: null,
  pozisyonlar: {
    ST: 1,
    OOS: 1,
    RW: 1,
    LW: 1,
    CM: 1,
    DM: 1,
    DC: 1,
    DR: 1,
    DL: 1,
    GK: 1
  }
})

// Düzenleme state'leri
const duzenleDialog = ref(false)
const duzenleOyuncuData = ref<Oyuncu>({
  id: 0,
  adSoyad: '',
  resim: '',
  pozisyonlar: {
    ST: 1,
    OOS: 1,
    RW: 1,
    LW: 1,
    CM: 1,
    DM: 1,
    DC: 1,
    DR: 1,
    DL: 1,
    GK: 1
  }
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
  { ad: 'Bitiricilik', deger: 10 },
  { ad: 'Dripling', deger: 10 },
  { ad: 'İlk Kontrol', deger: 10 },
  { ad: 'Kafa Vuruşu', deger: 10 },
  { ad: 'Korner', deger: 10 },
  { ad: 'Markaj', deger: 10 },
  { ad: 'Orta Yapma', deger: 10 },
  { ad: 'Pas', deger: 10 },
  { ad: 'Penaltı Kullanma', deger: 10 },
  { ad: 'Serbest Vuruş Kullanma', deger: 10 },
  { ad: 'Teknik', deger: 10 },
  { ad: 'Top Kapma', deger: 10 },
  { ad: 'Uzaktan Şut', deger: 10 },
  { ad: 'Uzun Taç', deger: 10 },
])

const mentalYetenekler = ref<Yetenek[]>([
  { ad: 'Agresiflik', deger: 10 },
  { ad: 'Cesaret', deger: 10 },
  { ad: 'Çalışkanlık', deger: 10 },
  { ad: 'Karar Alma', deger: 10 },
  { ad: 'Kararlılık', deger: 10 },
  { ad: 'Konsantrasyon', deger: 10 },
  { ad: 'Liderlik', deger: 10 },
  { ad: 'Önsezi', deger: 10 },
  { ad: 'Özel Yetenek', deger: 10 },
  { ad: 'Pozisyon Alma', deger: 10 },
  { ad: 'Soğukkanlılık', deger: 10 },
  { ad: 'Takım Oyunu', deger: 10 },
  { ad: 'Topsuz Alan', deger: 10 },
  { ad: 'Vizyon', deger: 10 },
])

const fizikselYetenekler = ref<Yetenek[]>([
  { ad: 'Çeviklik', deger: 10 },
  { ad: 'Dayanıklılık', deger: 10 },
  { ad: 'Denge', deger: 10 },
  { ad: 'Güç', deger: 10 },
  { ad: 'Hız', deger: 10 },
  { ad: 'Hızlanma', deger: 10 },
  { ad: 'Vücut Zindeliği', deger: 10 },
  { ad: 'Zıplama', deger: 10 },
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

  canliGuc.value = hesaplaOyuncuGucu(yeteneklerObj, secilenOyuncu.value.pozisyonlar || {
    ST: 1, OOS: 1, RW: 1, LW: 1, CM: 1,
    DM: 1, DC: 1, DR: 1, DL: 1, GK: 1
  })
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
  
  // Veritabanından gelen yetenekleri kullan veya varsayılan değerleri ata
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
  // Veritabanından gelen güç değerini kullan
  canliGuc.value = oyuncu.guc || 0
}

const kaydetOyuncu = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/oyuncular', yeniOyuncu.value)
    oyuncular.value.push(response.data)
    yeniOyuncuDialog.value = false
    yeniOyuncu.value = {
      adSoyad: '',
      resim: null,
      pozisyonlar: {
        ST: 1,
        OOS: 1,
        RW: 1,
        LW: 1,
        CM: 1,
        DM: 1,
        DC: 1,
        DR: 1,
        DL: 1,
        GK: 1
      }
    }
  } catch (error) {
    console.error('Oyuncu kaydedilirken hata:', error)
  }
}

const duzenleOyuncu = (oyuncu: Oyuncu) => {
  duzenleOyuncuData.value = { ...oyuncu }
  duzenleDialog.value = true
}

const kaydetDuzenleme = async () => {
  try {
    await api.updateOyuncu(duzenleOyuncuData.value.id, duzenleOyuncuData.value)
    await oyunculariYukle() // Listeyi güncelle
    duzenleDialog.value = false
  } catch (error) {
    console.error('Oyuncu güncellenirken hata oluştu:', error)
  }
}

const silOyuncu = async (id: number) => {
  try {
    await api.deleteOyuncu(id)
    await oyunculariYukle() // Listeyi güncelle
  } catch (error) {
    console.error('Oyuncu silinirken hata oluştu:', error)
  }
}

const yetenekleriKaydet = async () => {
  if (secilenOyuncu.value) {
    try {
      const yeteneklerObj: { [key: string]: number } = {}
      
      // Tüm kategorilerdeki yetenekleri birleştir
      ;[...teknikYetenekler.value, ...mentalYetenekler.value, ...fizikselYetenekler.value].forEach(yetenek => {
        yeteneklerObj[yetenek.ad] = Number(yetenek.deger)
      })
      
      const guc = hesaplaOyuncuGucu(yeteneklerObj, secilenOyuncu.value.pozisyonlar || {
        ST: 1, OOS: 1, RW: 1, LW: 1, CM: 1,
        DM: 1, DC: 1, DR: 1, DL: 1, GK: 1
      })

      const guncelOyuncu = {
        ...secilenOyuncu.value,
        yetenekler: yeteneklerObj,
        guc: guc,
      }
      
      await api.updateOyuncu(secilenOyuncu.value.id, guncelOyuncu)
      await oyunculariYukle() // Listeyi güncelle
    } catch (error) {
      console.error('Yetenekler kaydedilirken hata oluştu:', error)
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
const hesaplaOyuncuGucu = (yetenekler: { [key: string]: number }, pozisyonlar: Pozisyonlar) => {
  let toplamPuan = 0
  let toplamKatsayi = 0

  // En yüksek seviyeli pozisyona göre katsayıları belirle
  let enYuksekPozisyon = 'Orta Saha' // Varsayılan
  let enYuksekSeviye = 0

  // En yüksek seviyeli pozisyonu bul
  Object.entries(pozisyonlar).forEach(([poz, seviye]) => {
    if (seviye > enYuksekSeviye) {
      enYuksekSeviye = seviye
      switch(poz) {
        case 'ST':
          enYuksekPozisyon = 'Forvet'
          break
        case 'OOS':
        case 'CM':
        case 'DM':
          enYuksekPozisyon = 'Orta Saha'
          break
        case 'DC':
        case 'DL':
        case 'DR':
          enYuksekPozisyon = 'Defans'
          break
      }
    }
  })

  const katsayilar: { [key: string]: { [key: string]: number } } = {
    'Defans': {
      'Dripling': 2,
      'İlk Kontrol': 3,
      'Kafa Vuruşu': 4,
      'Markaj': 5,
      'Pas': 4,
      'Top Kapma': 5,
      'Teknik': 2,
      'Agresiflik': 4,
      'Önsezi': 4,
      'Cesaret': 3,
      'Soğukkanlılık': 4,
      'Konsantrasyon': 3,
      'Karar Alma': 4,
      'Pozisyon Alma': 5,
      'Hızlanma': 3,
      'Çeviklik': 4,
      'Zıplama': 4,
      'Hız': 4,
      'Güç': 4,
      'Dayanıklılık': 4,
    },
    'Orta Saha': {
      'Korner': 2,
      'Dripling': 3,
      'Bitiricilik': 3,
      'İlk Kontrol': 4,
      'Serbest Vuruş Kullanma': 2,
      'Uzaktan Şut': 4,
      'Markaj': 2,
      'Pas': 5,
      'Top Kapma': 3,
      'Teknik': 5,
      'Agresiflik': 3,
      'Karar Alma': 4,
      'Topsuz Alan': 5,
      'Pozisyon Alma': 4,
      'Vizyon': 4,
      'Hızlanma': 4,
      'Çeviklik': 3,
      'Denge': 3,
      'Hız': 3,
      'Dayanıklılık': 5,
      'Güç': 4,
    },
    'Forvet': {
      'Dripling': 4,
      'Bitiricilik': 5,
      'İlk Kontrol': 3,
      'Pas': 3,
      'Teknik': 3,
      'Karar Alma': 4,
      'Topsuz Alan': 5,
      'Hız': 4,
      'Hızlanma': 5,
      'Çeviklik': 5,
      'Denge': 3,
      'Zıplama': 3,
      'Güç': 4,
    }
  }

  const pozisyonKatsayilari = katsayilar[enYuksekPozisyon] || {}
  
  Object.entries(yetenekler).forEach(([yetenek, deger]) => {
    const katsayi = pozisyonKatsayilari[yetenek] || (enYuksekPozisyon === 'Forvet' ? 2 : 1)
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

// Resim işleme fonksiyonları
const resimDialogAc = (mod: 'yeni' | 'duzenle') => {
  resimModu.value = mod
  resimDialog.value = true
}

const resimDialogKapat = () => {
  resimDialog.value = false
  seciliResim.value = ''
}

const resimSecildi = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = e => {
      seciliResim.value = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const resimDegisti = ({ coordinates, canvas }: any) => {
  cropperRef.value = canvas
}

const resimKirp = () => {
  if (cropperRef.value) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const maxBoyut = 200

    // Orijinal resmi al
    const orijinalCanvas = cropperRef.value
    const orijinalGenislik = orijinalCanvas.width
    const orijinalYukseklik = orijinalCanvas.height

    // En büyük boyutu 200px olacak şekilde oranla
    let yeniGenislik = orijinalGenislik
    let yeniYukseklik = orijinalYukseklik

    if (orijinalGenislik > maxBoyut || orijinalYukseklik > maxBoyut) {
      if (orijinalGenislik > orijinalYukseklik) {
        yeniGenislik = maxBoyut
        yeniYukseklik = Math.round(orijinalYukseklik * (maxBoyut / orijinalGenislik))
      } else {
        yeniYukseklik = maxBoyut
        yeniGenislik = Math.round(orijinalGenislik * (maxBoyut / orijinalYukseklik))
      }
    }

    // Canvas boyutlarını ayarla
    canvas.width = yeniGenislik
    canvas.height = yeniYukseklik

    // Resmi yeniden boyutlandır
    ctx?.drawImage(orijinalCanvas, 0, 0, yeniGenislik, yeniYukseklik)

    // Küçültülmüş resmi base64 formatına çevir
    const kirpilanResim = canvas.toDataURL('image/jpeg', 0.8)
    
    if (resimModu.value === 'yeni') {
      yeniOyuncu.value.resim = kirpilanResim
    } else {
      duzenleOyuncuData.value.resim = kirpilanResim
    }
    
    resimDialogKapat()
  }
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

const togglePosition = (pos: PozisyonKodu) => {
  yeniOyuncu.value.pozisyonlar[pos] = (yeniOyuncu.value.pozisyonlar[pos] % 5) + 1
}

const getPosClass = (pos: PozisyonKodu): string => {
  return `level-${yeniOyuncu.value.pozisyonlar[pos]}`
}

const toggleDuzenlePosition = (pos: PozisyonKodu) => {
  if (!duzenleOyuncuData.value.pozisyonlar) {
    duzenleOyuncuData.value.pozisyonlar = {
      ST: 1, OOS: 1, RW: 1, LW: 1, CM: 1,
      DM: 1, DC: 1, DR: 1, DL: 1, GK: 1
    }
  }
  duzenleOyuncuData.value.pozisyonlar[pos] = (duzenleOyuncuData.value.pozisyonlar[pos] % 5) + 1
}

const getDuzenleClass = (pos: PozisyonKodu): string => {
  if (!duzenleOyuncuData.value.pozisyonlar) return 'level-1'
  return `level-${duzenleOyuncuData.value.pozisyonlar[pos]}`
}

const getPozisyonAciklama = (poz: string, seviye: number): string => {
  const seviyeAdi = {
    2: 'Kötü',
    3: 'Ortalama',
    4: 'İyi',
    5: 'Çok İyi'
  }[seviye] || ''

  const pozisyonAdi = {
    'ST': 'Forvet',
    'OOS': 'Ofansif Orta Saha',
    'RW': 'Sağ Kanat',
    'LW': 'Sol Kanat',
    'CM': 'Merkez Orta Saha',
    'DM': 'Defansif Orta Saha',
    'DC': 'Stoper',
    'DR': 'Sağ Bek',
    'DL': 'Sol Bek',
    'GK': 'Kaleci'
  }[poz] || poz

  return `${pozisyonAdi} - ${seviyeAdi}`
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
  background-color: white;
  color: black;
}

.yetenek-container:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.yetenek-label {
  font-size: 1rem;
  font-weight: 500;
  color: black;
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

/* Responsive styles */
.oyuncular-table {
  width: 100%;
  overflow-x: auto;
}

@media (max-width: 600px) {
  .yetenek-container {
    padding: 4px 8px;
    margin-bottom: 4px;
  }

  .yetenek-label {
    font-size: 0.875rem;
  }

  .yetenek-deger {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
    margin: 0 4px;
  }

  .yetenek-btn {
    width: 32px !important;
    height: 32px !important;
  }
}

/* Tablet ve üstü için stil ayarlamaları */
@media (min-width: 960px) {
  .yetenek-container {
    padding: 12px 24px;
    margin-bottom: 12px;
  }

  .yetenek-label {
    font-size: 1.1rem;
  }

  .yetenek-deger {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    margin: 0 12px;
  }

  .yetenek-btn {
    width: 42px !important;
    height: 42px !important;
  }
}

.football-field {
  background-color: #2c3e50;
  padding: 20px;
  border-radius: 8px;
  margin: 10px 0;
  background-image: linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.position-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.position-box {
  width: 60px;
  height: 40px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  border-radius: 4px;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
}

.level-1 { background-color: white; color: #333; text-shadow: none; }
.level-2 { background-color: #ffd700; color: #333; } /* Sarı - Kötü */
.level-3 { background-color: #ff9800; color: white; } /* Turuncu - Ortalama */
.level-4 { background-color: #2e7d32; color: white; } /* Koyu Yeşil - İyi */
.level-5 { background-color: #66bb6a; color: white; } /* Açık Yeşil - Çok İyi */

.position-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}

.legend-box {
  width: 30px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid;
}

/* Pozisyon mini kutuları için stil */
.positions-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 200px;
  min-height: 28px;
  align-items: center;
}

.position-mini-box {
  font-size: 0.75rem;
  padding: 4px 6px;
  border-radius: 3px;
  font-weight: bold;
  min-width: 32px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Responsive düzenlemeler */
@media (max-width: 600px) {
  .positions-preview {
    max-width: 150px;
  }
  
  .position-mini-box {
    font-size: 0.7rem;
    padding: 1px 3px;
    min-width: 28px;
  }
}

.yetenek-input :deep(input) {
  text-align: center;
  padding: 0;
  height: 40px;
  font-size: 1.25rem;
  font-weight: 600;
  color: inherit;
}

.yetenek-input :deep(.v-field__field) {
  height: 40px;
  display: flex;
  align-items: center;
}

.yetenek-input :deep(.v-field__input) {
  min-height: unset;
  padding: 0;
}

@media (max-width: 600px) {
  .yetenek-input :deep(input) {
    height: 36px;
    font-size: 1.1rem;
  }
  
  .yetenek-input :deep(.v-field__field) {
    height: 36px;
  }
}
</style> 
