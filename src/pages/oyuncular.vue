<template>
  <div>
    <VCard title="Oyuncular 👥">
      <VCardText>
        <div class="d-flex gap-4 mb-4">
        <VBtn
          color="success"
          @click="yeniOyuncuDialog = true"
        >
          Yeni Oyuncu Ekle
        </VBtn>
          <VBtn
            color="primary"
            @click="grupDialog = true"
          >
            Grup Yönetimi
          </VBtn>
        </div>

        <VTable class="oyuncular-table">
          <thead>
            <tr>
              <th class="d-none d-sm-table-cell">Fotoğraf</th>
              <th>Adı Soyadı</th>
              <th>Pozisyonlar</th>
              <th>Güç</th>
              <th>Gruplar</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="oyuncu in havuzdakiOyuncular" :key="oyuncu.id">
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
                <div class="d-flex gap-1 flex-wrap">
                  <VChip
                    v-for="grup in oyuncu.gruplar"
                    :key="grup.id"
                    size="small"
                    color="info"
                    class="mr-1"
                  >
                    {{ grup.isim }}
                  </VChip>
                </div>
              </td>
              <td>
                <div class="d-flex gap-1">
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
                    @click="oyuncuGruplariDuzenle(oyuncu)"
                  >
                    <VIcon size="small" icon="tabler-users" class="d-sm-none" />
                    <span class="d-none d-sm-block">Gruplar</span>
                  </VBtn>
                  <VBtn
                    size="small"
                    color="warning"
                    class="flex-grow-0"
                    @click="oyuncuYetenekleriDuzenle(oyuncu)"
                  >
                    <VIcon size="small" icon="tabler-award" class="d-sm-none" />
                    <span class="d-none d-sm-block">Yetenekler</span>
                  </VBtn>
                  <VBtn
                    size="small"
                    color="success"
                    @click="kaleciYetenekleriAc(oyuncu)"
                  >
                    <VIcon size="small" icon="tabler-soccer-field" class="d-sm-none" />
                    <span class="d-none d-sm-block">GK</span>
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
      </VCardText>
    </VCard>

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

    <!-- Oyuncu Grupları Dialog -->
    <VDialog v-model="oyuncuGruplariDialog.show" max-width="500">
      <VCard>
        <VCardTitle>{{ oyuncuGruplariDialog.oyuncu?.adSoyad }} - Gruplar</VCardTitle>
        <VCardText>
          <VSelect
            v-model="oyuncuGruplariDialog.seciliGruplar"
            :items="gruplar"
            item-title="isim"
            item-value="id"
            label="Gruplar"
            multiple
            chips
                variant="outlined"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="oyuncuGruplariDialog.show = false"
              >
                İptal
              </VBtn>
              <VBtn
            color="primary"
            @click="oyuncuGruplariKaydet"
              >
                Kaydet
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

    <!-- Oyuncu Düzenleme Dialog -->
    <VDialog v-model="duzenleDialog" max-width="500">
      <VCard>
        <VCardTitle>Oyuncu Düzenle</VCardTitle>
        <VCardText>
          <OyuncuForm
            ref="duzenleOyuncuForm"
            v-model="duzenleOyuncuData"
            :gruplar="gruplar"
            @submit="kaydetDuzenleme"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="duzenleDialog = false"
          >
            İptal
          </VBtn>
          <VBtn
            color="primary"
            @click="kaydetDuzenleme"
          >
            Kaydet
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Yeni Oyuncu Dialog -->
    <VDialog v-model="yeniOyuncuDialog" max-width="500">
      <VCard>
        <VCardTitle>Yeni Oyuncu Ekle</VCardTitle>
        <VCardText>
          <OyuncuForm
            ref="yeniOyuncuForm"
            v-model="yeniOyuncuData"
            :gruplar="gruplar"
            @submit="kaydetOyuncu"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="yeniOyuncuDialog = false"
          >
            İptal
          </VBtn>
          <VBtn
            color="primary"
            @click="kaydetOyuncu"
          >
            Kaydet
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Oyuncu Yetenekleri Dialog -->
    <VDialog v-model="oyuncuYetenekleriDialog.show" max-width="1200">
      <VCard>
        <VCardTitle>{{ oyuncuYetenekleriDialog.oyuncu?.adSoyad }} - Yetenekler</VCardTitle>
        <VCardText>
          <div class="d-flex flex-wrap gap-4">
            <!-- Teknik Özellikler -->
            <VCard variant="outlined" class="pa-4 flex-grow-1" style="min-width: 300px;">
              <div class="text-h6 mb-4">Teknik Özellikler</div>
              <div class="d-flex flex-column gap-4">
                <div v-for="ozellik in teknikOzellikler" :key="ozellik.id" class="yetenek-slider">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-subtitle-2">{{ ozellik.isim }}</span>
                    <VChip
                      :color="yetenekRengi(oyuncuYetenekleriDialog.yetenekler[ozellik.id])"
                      size="small"
                    >
                      {{ oyuncuYetenekleriDialog.yetenekler[ozellik.id] || 1 }}
                    </VChip>
                  </div>
                  <VSlider
                    v-model="oyuncuYetenekleriDialog.yetenekler[ozellik.id]"
                    :min="1"
                    :max="20"
                    :step="1"
                    :color="yetenekRengi(oyuncuYetenekleriDialog.yetenekler[ozellik.id])"
                    hide-details
                  />
                </div>
              </div>
            </VCard>

            <!-- Mental Özellikler -->
            <VCard variant="outlined" class="pa-4 flex-grow-1" style="min-width: 300px;">
              <div class="text-h6 mb-4">Mental Özellikler</div>
              <div class="d-flex flex-column gap-4">
                <div v-for="ozellik in mentalOzellikler" :key="ozellik.id" class="yetenek-slider">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-subtitle-2">{{ ozellik.isim }}</span>
                    <VChip
                      :color="yetenekRengi(oyuncuYetenekleriDialog.yetenekler[ozellik.id])"
                      size="small"
                    >
                      {{ oyuncuYetenekleriDialog.yetenekler[ozellik.id] || 1 }}
                    </VChip>
                  </div>
                  <VSlider
                    v-model="oyuncuYetenekleriDialog.yetenekler[ozellik.id]"
                    :min="1"
                    :max="20"
                    :step="1"
                    :color="yetenekRengi(oyuncuYetenekleriDialog.yetenekler[ozellik.id])"
                    hide-details
                  />
                </div>
              </div>
            </VCard>

            <!-- Fiziksel Özellikler -->
            <VCard variant="outlined" class="pa-4 flex-grow-1" style="min-width: 300px;">
              <div class="text-h6 mb-4">Fiziksel Özellikler</div>
              <div class="d-flex flex-column gap-4">
                <div v-for="ozellik in fizikselOzellikler" :key="ozellik.id" class="yetenek-slider">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-subtitle-2">{{ ozellik.isim }}</span>
                    <VChip
                      :color="yetenekRengi(oyuncuYetenekleriDialog.yetenekler[ozellik.id])"
                      size="small"
                    >
                      {{ oyuncuYetenekleriDialog.yetenekler[ozellik.id] || 1 }}
                    </VChip>
                  </div>
                  <VSlider
                    v-model="oyuncuYetenekleriDialog.yetenekler[ozellik.id]"
                    :min="1"
                    :max="20"
                    :step="1"
                    :color="yetenekRengi(oyuncuYetenekleriDialog.yetenekler[ozellik.id])"
                    hide-details
                  />
                </div>
              </div>
            </VCard>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="oyuncuYetenekleriDialog.show = false"
          >
            İptal
          </VBtn>
          <VBtn
            color="primary"
            @click="kaydetYetenekler"
            :loading="oyuncuYetenekleriDialog.kaydediliyor"
            :disabled="oyuncuYetenekleriDialog.kaydediliyor"
          >
            Kaydet
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Resim Kırpma Dialog -->
    <VDialog v-model="showCropper" max-width="500">
      <VCard>
        <VCardTitle>Resmi Kırp</VCardTitle>
        <VCardText>
          <div class="cropper-container">
            <VueCropper
              v-if="cropperImage"
              ref="cropperRef"
              class="cropper"
              :src="cropperImage"
              :aspect-ratio="1"
              :view-mode="1"
              :auto-crop-area="1"
              :background="true"
              :rotatable="false"
              :zoomable="true"
              :guide-lines="true"
              :center-indicator="true"
              :highlight="true"
              :crop-box-movable="true"
              :crop-box-resizable="true"
              :toggle-drag-mode-on-dblclick="false"
            />
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="showCropper = false"
          >
            İptal
          </VBtn>
          <VBtn
            color="primary"
            @click="resimKirp"
          >
            Kırp
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Kaleci Yetenekleri Dialog -->
    <VDialog v-model="kaleciYetenekleriDialog.show" max-width="800">
      <VCard v-if="kaleciYetenekleriDialog.oyuncu">
        <VCardTitle class="text-h5 pa-4">
          {{ kaleciYetenekleriDialog.oyuncu.adSoyad }} - Kaleci Yetenekleri
        </VCardTitle>
        <VCardText>
          <VRow>
            <!-- Teknik Özellikler -->
            <VCol cols="12" md="4">
              <div class="text-h6 mb-4">Teknik Özellikler</div>
              <div v-for="yetenek in ['ani_cikis_egilimi', 'birebir', 'degaj', 'elle_kontrol', 'elle_oyun_baslatma', 'hava_toplari', 'refleksler', 'yumrukla_uzaklastirma']" :key="yetenek" class="mb-4">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span>{{ formatYetenekAdi(yetenek) }}</span>
                  <span :class="{'green-text': kaleciYetenekleri[yetenek] >= 15, 'orange-text': kaleciYetenekleri[yetenek] >= 10 && kaleciYetenekleri[yetenek] < 15, 'red-text': kaleciYetenekleri[yetenek] < 10}">
                    {{ kaleciYetenekleri[yetenek] }}
                  </span>
                </div>
                <VSlider
                  v-model="kaleciYetenekleri[yetenek]"
                  :min="0"
                  :max="20"
                  :step="1"
                  :color="kaleciYetenekleri[yetenek] >= 15 ? 'success' : kaleciYetenekleri[yetenek] >= 10 ? 'warning' : 'error'"
                  thumb-label
                />
              </div>
            </VCol>

            <!-- Mental Özellikler -->
            <VCol cols="12" md="4">
              <div class="text-h6 mb-4">Mental Özellikler</div>
              <div v-for="yetenek in ['agresiflik', 'cesaret', 'karar_alma', 'kararlilik', 'konsantrasyon', 'liderlik', 'onsezi', 'sogukkanlilik']" :key="yetenek" class="mb-4">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span>{{ formatYetenekAdi(yetenek) }}</span>
                  <span :class="{'green-text': kaleciYetenekleri[yetenek] >= 15, 'orange-text': kaleciYetenekleri[yetenek] >= 10 && kaleciYetenekleri[yetenek] < 15, 'red-text': kaleciYetenekleri[yetenek] < 10}">
                    {{ kaleciYetenekleri[yetenek] }}
                  </span>
                </div>
                <VSlider
                  v-model="kaleciYetenekleri[yetenek]"
                  :min="0"
                  :max="20"
                  :step="1"
                  :color="kaleciYetenekleri[yetenek] >= 15 ? 'success' : kaleciYetenekleri[yetenek] >= 10 ? 'warning' : 'error'"
                  thumb-label
                />
              </div>
            </VCol>

            <!-- Fiziksel Özellikler -->
            <VCol cols="12" md="4">
              <div class="text-h6 mb-4">Fiziksel Özellikler</div>
              <div v-for="yetenek in ['eksantriklik', 'ilk_kontrol', 'pas', 'takim_oyunu']" :key="yetenek" class="mb-4">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span>{{ formatYetenekAdi(yetenek) }}</span>
                  <span :class="{'green-text': kaleciYetenekleri[yetenek] >= 15, 'orange-text': kaleciYetenekleri[yetenek] >= 10 && kaleciYetenekleri[yetenek] < 15, 'red-text': kaleciYetenekleri[yetenek] < 10}">
                    {{ kaleciYetenekleri[yetenek] }}
                  </span>
                </div>
                <VSlider
                  v-model="kaleciYetenekleri[yetenek]"
                  :min="0"
                  :max="20"
                  :step="1"
                  :color="kaleciYetenekleri[yetenek] >= 15 ? 'success' : kaleciYetenekleri[yetenek] >= 10 ? 'warning' : 'error'"
                  thumb-label
                />
              </div>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="error" @click="kaleciYetenekleriDialog.show = false">İptal</VBtn>
          
          <VBtn 
            color="success" 
            :loading="kaleciYetenekleriDialog.kaydediliyor"
            @click="kaleciYetenekleriKaydet"
            
          >
            Kaydet
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import OyuncuForm from '@/components/OyuncuForm.vue'
import type { Grup, KaleciYetenekleri } from '@/services/api'
import api from '@/services/api'
import 'cropperjs/dist/cropper.css'
import { computed, onMounted, ref } from 'vue'
import VueCropper from 'vue-cropperjs'

declare module 'vue-cropperjs' {
  const content: any
  export default content
}

interface Oyuncu {
  id: number
  adSoyad: string
  resim?: string
  guc?: number
  pozisyonlar?: {
    [key: string]: number
  }
  gruplar?: Grup[]
  yetenekler?: string[]
}

interface OyuncuYetenek {
  ozellik_id: number
  seviye: number
}

interface OyuncuOzelligi {
  id: number
  isim: string
}

declare module '@/services/api' {
  interface Api {
    getOyuncuOzellikleri(): Promise<OyuncuOzelligi[]>
    getOyuncuYetenekleri(oyuncuId: number): Promise<OyuncuYetenek[]>
    updateOyuncuYetenekleri(oyuncuId: number, yetenekler: OyuncuYetenek[]): Promise<void>
  }
}

const havuzdakiOyuncular = ref<Oyuncu[]>([])
const grupDialog = ref(false)
const gruplar = ref<Grup[]>([])
const yeniGrup = ref({
  isim: ''
})

const yeniOyuncuDialog = ref(false)
const yeniOyuncuForm = ref<any>(null)
const duzenleOyuncuForm = ref<any>(null)
const adSoyadKurallari = [
  (v: string) => !!v?.trim() || 'Ad Soyad alanı zorunludur',
  (v: string) => v?.trim().length >= 2 || 'Ad Soyad en az 2 karakter olmalıdır'
]

const oyuncuGruplariDialog = ref({
  show: false,
  oyuncu: null as Oyuncu | null,
  seciliGruplar: [] as number[]
})

const duzenleDialog = ref(false)
const duzenleOyuncuData = ref<Oyuncu>({
  id: 0,
  adSoyad: '',
  resim: '',
  pozisyonlar: {}
})

const yeniOyuncuData = ref<Omit<Oyuncu, 'id'>>({
  adSoyad: '',
  resim: '',
  pozisyonlar: {},
  gruplar: []
})

interface OyuncuOzelligi {
  id: number
  isim: string
}

const oyuncuOzellikleri = ref<OyuncuOzelligi[]>([])
const oyuncuYetenekleriDialog = ref({
  show: false,
  oyuncu: null as Oyuncu | null,
  yetenekler: {} as { [key: number]: number },
  kaydediliyor: false
})

const showCropper = ref(false)
const cropperRef = ref()
const cropperImage = ref('')

const fileInput = ref<HTMLInputElement | null>(null)

const kaleciYetenekleriDialog = ref({
  show: false,
  oyuncu: null as Oyuncu | null,
  kaydediliyor: false
})

const kaleciYetenekleri = ref<KaleciYetenekleri>({
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
})

const kaleciYetenekleriAc = async (oyuncu: Oyuncu) => {
  kaleciYetenekleriDialog.value.oyuncu = oyuncu
  kaleciYetenekleriDialog.value.show = true

  try {
    const yetenekler = await api.getKaleciYetenekleri(oyuncu.id)
    Object.assign(kaleciYetenekleri.value, yetenekler)
  } catch (error) {
    console.error('Kaleci yetenekleri yüklenirken hata:', error)
    showToast('Kaleci yetenekleri yüklenemedi', 'error')
  }
}

const formatYetenekAdi = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const kaleciYetenekleriKaydet = async () => {
  if (!kaleciYetenekleriDialog.value.oyuncu) return

  try {
    kaleciYetenekleriDialog.value.kaydediliyor = true
    const { kaleciGucu } = await api.updateKaleciYetenekleri(
      kaleciYetenekleriDialog.value.oyuncu.id, 
      kaleciYetenekleri.value
    )
    
    kaleciYetenekleriDialog.value.oyuncu.kaleci_gucu = kaleciGucu
    kaleciYetenekleriDialog.value.show = false
    showToast('Kaleci yetenekleri güncellendi')
    await oyunculariYukle()
  } catch (error) {
    console.error('Kaleci yetenekleri kaydedilirken hata:', error)
    showToast('Kaleci yetenekleri kaydedilemedi', 'error')
  } finally {
    kaleciYetenekleriDialog.value.kaydediliyor = false
  }
}

// Oyuncuları yükle
const oyunculariYukle = async () => {
  try {
    havuzdakiOyuncular.value = await api.getOyuncular()
  } catch (error) {
    console.error('Oyuncular yüklenirken hata:', error)
  }
}

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

// Oyuncu gruplarını düzenle
const oyuncuGruplariDuzenle = (oyuncu: Oyuncu) => {
  oyuncuGruplariDialog.value = {
    show: true,
    oyuncu,
    seciliGruplar: oyuncu.gruplar?.map(g => g.id) || []
  }
}

// Oyuncu gruplarını kaydet
const oyuncuGruplariKaydet = async () => {
  try {
    if (!oyuncuGruplariDialog.value.oyuncu) return

    await api.updateOyuncuGruplari(
      oyuncuGruplariDialog.value.oyuncu.id,
      oyuncuGruplariDialog.value.seciliGruplar
    )

    await oyunculariYukle()
    oyuncuGruplariDialog.value.show = false
    showToast('Oyuncu grupları güncellendi', 'success')
  } catch (error) {
    console.error('Oyuncu grupları güncellenirken hata:', error)
    showToast('Oyuncu grupları güncellenirken bir hata oluştu', 'error')
  }
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

// Güç rengi belirleme fonksiyonu
const oyuncuGucRengi = (guc?: number) => {
  if (!guc) return 'default'
  if (guc >= 80) return 'success'
  if (guc >= 60) return 'info'
  return 'error'
}

// Pozisyon açıklama fonksiyonu
const getPozisyonAciklama = (pozisyon: string, seviye: number) => {
  const pozisyonlar: { [key: string]: string } = {
    ST: 'Forvet',
    LW: 'Sol Kanat',
    OOS: 'Ofansif Orta Saha',
    RW: 'Sağ Kanat',
    MC: 'Orta Saha',
    DM: 'Defansif Orta Saha',
    DL: 'Sol Bek',
    DC: 'Stoper',
    DR: 'Sağ Bek',
    GK: 'Kaleci'
  }

  const seviyeler = ['', 'Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Çok İyi']
  return `${pozisyonlar[pozisyon]}: ${seviyeler[seviye]}`
}

// Pozisyonları sırala
const siraliPozisyonlar = (pozisyonlar: { [key: string]: number }): { [key: string]: number } => {
  // Pozisyonları seviyelerine göre grupla
  const gruplar: { [key: number]: { [key: string]: number } } = {}
  
  Object.entries(pozisyonlar).forEach(([poz, seviye]) => {
    if (seviye >= 3) { // Sadece 3 ve üzeri seviyeleri al
      if (!gruplar[seviye]) {
        gruplar[seviye] = {}
      }
      gruplar[seviye][poz] = seviye
    }
  })
  
  // Sıralı pozisyonları birleştir (5'ten 3'e doğru)
  const siraliPozisyonlar: { [key: string]: number } = {}
  for (let seviye = 5; seviye >= 3; seviye--) {
    if (gruplar[seviye]) {
      Object.entries(gruplar[seviye]).forEach(([poz, sev]) => {
        siraliPozisyonlar[poz] = sev
      })
    }
  }
  
  return siraliPozisyonlar
}

// Oyuncu düzenleme
const duzenleOyuncu = (oyuncu: Oyuncu) => {
  duzenleOyuncuData.value = { ...oyuncu }
  duzenleDialog.value = true
}

// Oyuncu silme
const silOyuncu = async (oyuncuId: number) => {
  try {
    await api.deleteOyuncu(oyuncuId)
    await oyunculariYukle()
    showToast('Oyuncu başarıyla silindi', 'success')
  } catch (error) {
    console.error('Oyuncu silinirken hata:', error)
    showToast('Oyuncu silinirken bir hata oluştu', 'error')
  }
}

// Oyuncu düzenleme işlemi
const kaydetDuzenleme = async () => {
  try {
    // Form validasyonunu kontrol et
    const { valid } = await duzenleOyuncuForm.value?.validate()
    if (!valid) {
      showToast('Lütfen gerekli alanları doldurun', 'error')
      return
    }

    if (!duzenleOyuncuData.value.id) return

    // Pozisyonları filtrele - sadece 0'dan büyük olanları al
    const filtrelenmisPozsiyonlar = Object.entries(duzenleOyuncuData.value.pozisyonlar || {})
      .reduce((acc, [key, value]) => {
        if (value && value > 0) {
          acc[key] = value
        }
        return acc
      }, {} as { [key: string]: number })

    await api.updateOyuncu(duzenleOyuncuData.value.id, {
      ...duzenleOyuncuData.value,
      pozisyonlar: filtrelenmisPozsiyonlar
    })

    await oyunculariYukle()
    duzenleDialog.value = false
    showToast('Oyuncu başarıyla güncellendi', 'success')
  } catch (error) {
    console.error('Oyuncu güncellenirken hata:', error)
    showToast('Oyuncu güncellenirken bir hata oluştu', 'error')
  }
}

const kaydetOyuncu = async () => {
  try {
    // Form validasyonunu kontrol et
    const { valid } = await yeniOyuncuForm.value?.validate()
    if (!valid) {
      showToast('Lütfen gerekli alanları doldurun', 'error')
      return
    }

    // Ad soyad boş kontrolü
    if (!yeniOyuncuData.value.adSoyad?.trim()) {
      showToast('Ad Soyad alanı zorunludur', 'error')
      return
    }

    // Pozisyonları filtrele - sadece 0'dan büyük olanları al
    const filtrelenmisPozsiyonlar = Object.entries(yeniOyuncuData.value.pozisyonlar || {})
      .reduce((acc, [key, value]) => {
        if (value && value > 0) {
          acc[key] = value
        }
        return acc
      }, {} as { [key: string]: number })

    // Yeni oyuncu ekle
    await api.createOyuncu({
      adSoyad: yeniOyuncuData.value.adSoyad.trim(),
      resim: yeniOyuncuData.value.resim,
      gruplar: yeniOyuncuData.value.gruplar,
      pozisyonlar: filtrelenmisPozsiyonlar
    })

    await oyunculariYukle()
    yeniOyuncuDialog.value = false
    yeniOyuncuData.value = {
      adSoyad: '',
      resim: '',
      pozisyonlar: {},
      gruplar: []
    }
    showToast('Oyuncu başarıyla eklendi', 'success')
  } catch (error) {
    console.error('Oyuncu eklenirken hata:', error)
    showToast('Oyuncu eklenirken bir hata oluştu', 'error')
  }
}

// Oyuncu özelliklerini yükle
const ozellikleriYukle = async () => {
  try {
    oyuncuOzellikleri.value = await api.getOyuncuOzellikleri()
  } catch (error) {
    console.error('Özellikler yüklenirken hata:', error)
  }
}

// Oyuncu yeteneklerini düzenle
const oyuncuYetenekleriDuzenle = async (oyuncu: Oyuncu) => {
  try {
    const yetenekler = await api.getOyuncuYetenekleri(oyuncu.id)
    const ozellikler = await api.getOyuncuOzellikleri()

    // Tüm özellikleri döngüye al ve değeri olmayanlara 10 ata
    const yetenekMap = {}
    
    // Her özellik için varsayılan değer ata
    ozellikler.forEach(ozellik => {
      yetenekMap[ozellik.id] = 10
    })

    // Mevcut yetenekleri ekle
    if (yetenekler && typeof yetenekler === 'object') {
      Object.entries(yetenekler).forEach(([key, value]) => {
        // Özellik ID'sini bul
        const ozellik = ozellikler.find(o => {
          const columnName = o.isim
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/İ/g, 'i')
            .replace(/Ğ/g, 'g')
            .replace(/Ü/g, 'u')
            .replace(/Ş/g, 's')
            .replace(/Ö/g, 'o')
            .replace(/Ç/g, 'c')
          return columnName === key
        })
        
        if (ozellik) {
          yetenekMap[ozellik.id] = value
        }
      })
    }

    oyuncuYetenekleriDialog.value = {
      show: true,
      oyuncu,
      yetenekler: yetenekMap
    }
  } catch (error) {
    console.error('Yetenekler yüklenirken hata:', error)
    showToast('Yetenekler yüklenirken bir hata oluştu', 'error')
  }
}

// Yetenek seviyesine göre renk belirleme
const yetenekRengi = (seviye: number) => {
  if (!seviye) return 'grey'
  if (seviye >= 16) return 'success'
  if (seviye >= 11) return 'info'
  if (seviye >= 6) return 'warning'
  return 'error'
}

// Yetenekleri kaydet
const kaydetYetenekler = async () => {
  try {
    if (!oyuncuYetenekleriDialog.value?.oyuncu || oyuncuYetenekleriDialog.value.kaydediliyor) {
      return
    }

    oyuncuYetenekleriDialog.value.kaydediliyor = true

    const oyuncuId = oyuncuYetenekleriDialog.value.oyuncu.id
    const yeteneklerArray = Object.entries(oyuncuYetenekleriDialog.value.yetenekler).map(([ozellik_id, seviye]) => ({
      ozellik_id: Number(ozellik_id),
      seviye: Number(seviye)
    }))

    // Yetenekleri API'ye gönder
    await api.updateOyuncuYetenekleri(oyuncuId, yeteneklerArray)

    // Her mevki için query'i çalıştır
    const mevkiQueryMap = [
      { q_id: 1, column: 'ST' },
      { q_id: 2, column: 'OS' },
      { q_id: 3, column: 'RW' },
      { q_id: 4, column: 'LW' },
      { q_id: 5, column: 'CM' },
      { q_id: 6, column: 'DM' },
      { q_id: 7, column: 'DC' },
      { q_id: 8, column: 'DR' },
      { q_id: 9, column: 'DL' },
      { q_id: 10, column: 'GK' }
    ]

    // Tüm mevkilerin sonuçlarını topla
    const pozisyonlar: { [key: string]: number } = {}
    
    for (const { q_id, column } of mevkiQueryMap) {
      try {
        console.log(`${column} için query çalıştırılıyor (q_id: ${q_id})...`)
        const response = await api.executeQueryById(oyuncuId, q_id)
        console.log(`${column} query sonucu:`, response)
        
        // Direkt olarak sayısal değeri al
        pozisyonlar[column] = response
      } catch (error) {
        console.error(`${column} pozisyonu için query çalıştırılırken hata:`, error)
      }
    }

    console.log('Toplanmış pozisyonlar:', pozisyonlar)

    // Eğer pozisyonlar boş değilse güncelle
    if (Object.keys(pozisyonlar).length > 0) {
      console.log('Pozisyonlar güncelleniyor...')
      const updateResponse = await api.updateYeniPozisyonlar(oyuncuId, pozisyonlar)
      console.log('Güncelleme sonucu:', updateResponse)
    }

    // Oyuncular listesini güncelle
    await oyunculariYukle()

    oyuncuYetenekleriDialog.value.show = false
    showToast('Yetenekler ve pozisyonlar başarıyla güncellendi', 'success')
  } catch (error) {
    console.error('Yetenekler kaydedilirken hata:', error)
    showToast('Yetenekler kaydedilirken bir hata oluştu', 'error')
  } finally {
    oyuncuYetenekleriDialog.value.kaydediliyor = false
  }
}

// Script kısmına eklenecek computed özellikler
const teknikOzellikler = computed(() => {
  return oyuncuOzellikleri.value.filter(o => [
    'Bitiricilik', 'Dripling', 'İlk Kontrol', 'Kafa Vuruşu', 'Korner',
    'Markaj', 'Orta Yapma', 'Pas', 'Penaltı Kullanma', 'Serbest Vuruş Kullanma',
    'Teknik', 'Top Kapma', 'Uzaktan Şut', 'Uzun Taç'
  ].includes(o.isim))
})

const mentalOzellikler = computed(() => {
  return oyuncuOzellikleri.value.filter(o => [
    'Agresiflik', 'Cesaret', 'Çalışkanlık', 'Karar Alma', 'Kararlılık',
    'Konsantrasyon', 'Liderlik', 'Önsezi', 'Özel Yetenek', 'Pozisyon Alma',
    'Soğukkanlılık', 'Takım Oyunu', 'Topsuz Alan', 'Vizyon'
  ].includes(o.isim))
})

const fizikselOzellikler = computed(() => {
  return oyuncuOzellikleri.value.filter(o => [
    'Çeviklik', 'Dayanıklılık', 'Denge', 'Güç', 'Hız',
    'Hızlanma', 'Vücut Zindeliği', 'Zıplama'
  ].includes(o.isim))
})

// Resim kırpma başarılı olduğunda
const resimKirpmaBasarili = (imgDataUrl: string, field: string) => {
  yeniOyuncuData.value.resim = imgDataUrl
}

// Resim yükleme başarılı olduğunda (bu örnekte kullanılmıyor çünkü yükleme yapmıyoruz)
const resimYuklemeBasarili = (jsonData: any, field: string) => {
  console.log('Resim yükleme başarılı:', jsonData)
}

// Resim yükleme başarısız olduğunda
const resimYuklemeBaşarisiz = (status: number, field: string) => {
  console.error('Resim yükleme başarısız:', status)
  showToast('Resim yükleme başarısız oldu', 'error')
}

// Resim yükleme ve kırpma fonksiyonlarını ekleyelim
const resimSec = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      cropperImage.value = e.target?.result as string
      showCropper.value = true
    }
    reader.readAsDataURL(input.files[0])
  }
}

const resimKirp = () => {
  if (cropperRef.value) {
    const canvas = cropperRef.value.getCroppedCanvas({
      width: 200,
      height: 200
    })
    yeniOyuncuData.value.resim = canvas.toDataURL('image/jpeg', 0.8)
    showCropper.value = false
  }
}

// Pozisyon seviyesine göre CSS sınıfı belirleme
const getPozisyonClass = (seviye?: number) => {
  if (seviye === undefined || seviye === 0) return 'level-0'
  if (seviye === 1) return 'level-1'
  if (seviye === 2) return 'level-2'
  if (seviye === 3) return 'level-3'
  if (seviye === 4) return 'level-4'
  return 'level-0'
}

onMounted(() => {
  oyunculariYukle()
  gruplariYukle()
  ozellikleriYukle()
})
</script>

<style scoped>
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

.level-1 { background-color: #ff0000; color: white; } /* Kırmızı - Çok Zayıf */
.level-2 { background-color: #ffa500; color: white; } /* Turuncu - Zayıf */
.level-3 { background-color: #ffff00; color: black; } /* Sarı - Orta */
.level-4 { background-color: #2e7d32; color: white; } /* Koyu Yeşil - İyi */
.level-5 { background-color: #66bb6a; color: white; } /* Açık Yeşil - Çok İyi */

.yetenek-slider {
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.yetenek-slider:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

@media (max-width: 600px) {
  .position-mini-box {
    font-size: 0.7rem;
    padding: 1px 3px;
    min-width: 28px;
  }
}

.cropper-container {
  width: 100%;
  height: 400px;
  background: #DDD;
}

.cropper {
  height: 100%;
  width: 100%;
  background-size: contain;
}

.position-grid {
  max-width: 500px;
  margin: 0 auto;
  padding: 16px;
}

.position-background {
  background-image: url('/images/football-field.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  padding: 24px 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  position: relative;
  aspect-ratio: 1.4;
}

.position-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  pointer-events: none;
}

.position-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.position-cell {
  flex: 1;
  min-width: 90px;
}

.position-label {
  color: white;
  font-size: 0.75rem;
  text-align: center;
  margin-bottom: 4px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  font-weight: 600;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin: 0 auto 4px;
}

.position-select {
  width: 100%;
  backdrop-filter: blur(4px);
}

.position-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.position-select :deep(.v-field:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.25);
  border-color: rgba(255, 255, 255, 0.3);
}

.position-select.level-0 :deep(.v-field) {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #333 !important;
}

.position-select.level-1 :deep(.v-field) {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #333 !important;
}

.position-select.level-2 :deep(.v-field) {
  background: rgba(255, 152, 0, 0.85) !important; /* Turuncu */
  color: white !important;
}

.position-select.level-3 :deep(.v-field) {
  background: rgba(46, 125, 50, 0.85) !important; /* Koyu Yeşil */
  color: white !important;
}

.position-select.level-4 :deep(.v-field) {
  background: rgba(102, 187, 106, 0.85) !important; /* Açık Yeşil */
  color: white !important;
  border-color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 600px) {
  .position-grid {
    padding: 8px;
  }
  
  .position-background {
    padding: 16px 8px;
  }
  
  .position-cell {
    min-width: 70px;
  }
  
  .position-label {
    font-size: 0.7rem;
  }
}

.green-text {
  color: rgb(76, 175, 80);
}
.orange-text {
  color: rgb(255, 152, 0);
}
.red-text {
  color: rgb(244, 67, 54);
}
</style> 
