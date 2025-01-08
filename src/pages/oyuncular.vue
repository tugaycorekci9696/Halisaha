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
            </VCardTitle>
            <VCardText class="pa-6">
              <VTabs v-model="activeTab" color="info" grow class="mb-6">
                <VTab value="teknik">
                  <VIcon icon="tabler-tool" class="me-2" />
                  Teknik
                </VTab>
                <VTab value="mental">
                  <VIcon icon="tabler-brain" class="me-2" />
                  Mental
                </VTab>
                <VTab value="fiziksel">
                  <VIcon icon="tabler-run" class="me-2" />
                  Fiziksel
                </VTab>
              </VTabs>

              <VWindow v-model="activeTab" class="mt-4">
                <!-- Teknik Yetenekler -->
                <VWindowItem value="teknik">
                  <VRow class="mt-2">
                    <VCol cols="3" v-for="yetenek in teknikYetenekler" :key="yetenek.ad" class="pa-4">
                      <div class="d-flex align-center">
                        <VTextField
                          v-model="yetenek.deger"
                          :label="yetenek.ad"
                          type="number"
                          min="0"
                          max="20"
                          :rules="[v => (v >= 0 && v <= 20) || 'Değer 0-20 arasında olmalıdır']"
                          :color="yetenekRengi(Number(yetenek.deger))"
                          density="compact"
                          class="me-2"
                          style="width: 150px"
                          variant="outlined"
                          hide-details
                          @input="validateInput(yetenek)"
                        />
                        <span :class="['text-caption font-weight-medium', 'text-' + yetenekRengi(Number(yetenek.deger))]">
                          /20
                        </span>
                      </div>
                    </VCol>
                  </VRow>
                </VWindowItem>

                <!-- Mental Yetenekler -->
                <VWindowItem value="mental">
                  <VRow class="mt-2">
                    <VCol cols="3" v-for="yetenek in mentalYetenekler" :key="yetenek.ad" class="pa-4">
                      <div class="d-flex align-center">
                        <VTextField
                          v-model="yetenek.deger"
                          :label="yetenek.ad"
                          type="number"
                          min="0"
                          max="20"
                          :rules="[v => (v >= 0 && v <= 20) || 'Değer 0-20 arasında olmalıdır']"
                          :color="yetenekRengi(Number(yetenek.deger))"
                          density="compact"
                          class="me-2"
                          style="width: 150px"
                          variant="outlined"
                          hide-details
                          @input="validateInput(yetenek)"
                        />
                        <span :class="['text-caption font-weight-medium', 'text-' + yetenekRengi(Number(yetenek.deger))]">
                          /20
                        </span>
                      </div>
                    </VCol>
                  </VRow>
                </VWindowItem>

                <!-- Fiziksel Yetenekler -->
                <VWindowItem value="fiziksel">
                  <VRow class="mt-2">
                    <VCol cols="3" v-for="yetenek in fizikselYetenekler" :key="yetenek.ad" class="pa-4">
                      <div class="d-flex align-center">
                        <VTextField
                          v-model="yetenek.deger"
                          :label="yetenek.ad"
                          type="number"
                          min="0"
                          max="20"
                          :rules="[v => (v >= 0 && v <= 20) || 'Değer 0-20 arasında olmalıdır']"
                          :color="yetenekRengi(Number(yetenek.deger))"
                          density="compact"
                          class="me-2"
                          style="width: 150px"
                          variant="outlined"
                          hide-details
                          @input="validateInput(yetenek)"
                        />
                        <span :class="['text-caption font-weight-medium', 'text-' + yetenekRengi(Number(yetenek.deger))]">
                          /20
                        </span>
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
  { ad: 'Corners', deger: 0 },
  { ad: 'Crossing', deger: 0 },
  { ad: 'Dribbling', deger: 0 },
  { ad: 'Finishing', deger: 0 },
  { ad: 'First Touch', deger: 0 },
  { ad: 'Free Kick Taking', deger: 0 },
  { ad: 'Heading', deger: 0 },
  { ad: 'Long Shots', deger: 0 },
  { ad: 'Long Throws', deger: 0 },
  { ad: 'Marking', deger: 0 },
  { ad: 'Passing', deger: 0 },
  { ad: 'Penalty Taking', deger: 0 },
  { ad: 'Tackling', deger: 0 },
  { ad: 'Technique', deger: 0 },
])

const mentalYetenekler = ref<Yetenek[]>([
  { ad: 'Aggression', deger: 0 },
  { ad: 'Anticipation', deger: 0 },
  { ad: 'Bravery', deger: 0 },
  { ad: 'Composure', deger: 0 },
  { ad: 'Concentration', deger: 0 },
  { ad: 'Decisions', deger: 0 },
  { ad: 'Determination', deger: 0 },
  { ad: 'Flair', deger: 0 },
  { ad: 'Leadership', deger: 0 },
  { ad: 'Off The Ball', deger: 0 },
  { ad: 'Positioning', deger: 0 },
  { ad: 'Teamwork', deger: 0 },
  { ad: 'Vision', deger: 0 },
  { ad: 'Work Rate', deger: 0 },
])

const fizikselYetenekler = ref<Yetenek[]>([
  { ad: 'Acceleration', deger: 0 },
  { ad: 'Agility', deger: 0 },
  { ad: 'Balance', deger: 0 },
  { ad: 'Jumping Reach', deger: 0 },
  { ad: 'Natural Fitness', deger: 0 },
  { ad: 'Pace', deger: 0 },
  { ad: 'Stamina', deger: 0 },
  { ad: 'Strength', deger: 0 },
])

const validateInput = (yetenek: Yetenek) => {
  let value = Number(yetenek.deger)
  if (value < 0) yetenek.deger = 0
  if (value > 20) yetenek.deger = 20
}

const yetenekRengi = (deger: number) => {
  if (deger >= 15) return 'success'
  if (deger >= 10) return 'info'
  return 'error'
}

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
    const kirpilanResim = cropperRef.value.toDataURL()
    
    if (resimModu.value === 'yeni') {
      yeniOyuncu.value.resim = kirpilanResim
    } else {
      duzenleOyuncuData.value.resim = kirpilanResim
    }
    
    resimDialogKapat()
  }
}

const kaydetOyuncu = () => {
  oyuncular.value.push({
    id: oyuncular.value.length + 1,
    ...yeniOyuncu.value,
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

const yetenekleriDuzenle = (oyuncu: Oyuncu) => {
  secilenOyuncu.value = oyuncu
  
  // Mevcut yetenekleri yükle
  if (oyuncu.yetenekler) {
    [...teknikYetenekler.value, ...mentalYetenekler.value, ...fizikselYetenekler.value].forEach(yetenek => {
      yetenek.deger = oyuncu.yetenekler?.[yetenek.ad] || 0
    })
  }
  
  yeteneklerDialog.value = true
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
      oyuncular.value[index] = {
        ...oyuncular.value[index],
        yetenekler: yeteneklerObj,
      }
    }
  }
  
  yeteneklerDialog.value = false
}
</script>

<style scoped>
.cropper {
  height: 400px;
  background: #DDD;
}
</style> 