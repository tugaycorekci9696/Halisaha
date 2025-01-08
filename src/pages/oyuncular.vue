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
</script>

<style scoped>
.cropper {
  height: 400px;
  background: #DDD;
}
</style> 