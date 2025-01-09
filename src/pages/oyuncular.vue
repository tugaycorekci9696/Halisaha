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
                    @click="oyuncuGruplariDuzenle(oyuncu)"
                  >
                    <VIcon size="small" icon="tabler-users" class="d-sm-none" />
                    <span class="d-none d-sm-block">Gruplar</span>
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
              <VForm @submit.prevent="kaydetDuzenleme">
                <VTextField
                  v-model="duzenleOyuncuData.adSoyad"
                  label="Adı Soyadı"
                  variant="outlined"
              density="compact"
                  class="mb-4"
            />
              </VForm>
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
          <VForm @submit.prevent="kaydetOyuncu">
            <VTextField
              v-model="yeniOyuncuData.adSoyad"
              label="Adı Soyadı"
              variant="outlined"
              density="compact"
              class="mb-4"
            />
          </VForm>
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
  </div>
</template>

<script setup lang="ts">
import type { Grup } from '@/services/api'
import api from '@/services/api'
import { onMounted, ref } from 'vue'

interface Oyuncu {
  id: number
  adSoyad: string
  resim?: string
  guc?: number
  pozisyonlar?: {
    [key: string]: number
  }
  gruplar?: Grup[]
}

const havuzdakiOyuncular = ref<Oyuncu[]>([])
const grupDialog = ref(false)
const gruplar = ref<Grup[]>([])
const yeniGrup = ref({
  isim: ''
})

const yeniOyuncuDialog = ref(false)

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
  pozisyonlar: {}
})

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

// Pozisyonları sırala
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
    if (!duzenleOyuncuData.value.id) return

    await api.updateOyuncu(duzenleOyuncuData.value.id, duzenleOyuncuData.value)

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
    if (!yeniOyuncuData.value.adSoyad) return

    await api.createOyuncu(yeniOyuncuData.value)

    await oyunculariYukle()
    yeniOyuncuDialog.value = false
    yeniOyuncuData.value = {
      adSoyad: '',
      resim: '',
      pozisyonlar: {}
    }
    showToast('Oyuncu başarıyla eklendi', 'success')
  } catch (error) {
    console.error('Oyuncu eklenirken hata:', error)
    showToast('Oyuncu eklenirken bir hata oluştu', 'error')
  }
}

onMounted(() => {
  oyunculariYukle()
  gruplariYukle()
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

.level-1 { background-color: white; color: #333; text-shadow: none; }
.level-2 { background-color: #ffd700; color: #333; } /* Sarı - Kötü */
.level-3 { background-color: #ff9800; color: white; } /* Turuncu - Ortalama */
.level-4 { background-color: #2e7d32; color: white; } /* Koyu Yeşil - İyi */
.level-5 { background-color: #66bb6a; color: white; } /* Açık Yeşil - Çok İyi */

@media (max-width: 600px) {
  .position-mini-box {
    font-size: 0.7rem;
    padding: 1px 3px;
    min-width: 28px;
  }
}
</style> 
