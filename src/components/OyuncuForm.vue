<template>
  <VForm 
    ref="formRef"
    @submit.prevent="$emit('submit')"
  >
    <div class="d-flex align-center mb-4">
      <VAvatar size="100" class="mr-4">
        <VImg
          v-if="modelValue.resim"
          :src="modelValue.resim"
          alt="Oyuncu resmi"
        />
        <VIcon v-else icon="tabler-user" size="48" />
      </VAvatar>
      <div>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          class="d-none"
          @change="resimSec"
        />
        <VBtn
          color="primary"
          variant="outlined"
          @click="$refs.fileInput.click()"
        >
          Profil Resmi Seç
        </VBtn>
      </div>
    </div>
    <VTextField
      v-model="modelValue.adSoyad"
      label="Adı Soyadı"
      variant="outlined"
      density="compact"
      class="mb-4"
      :rules="adSoyadKurallari"
    />
    <VSelect
      v-model="modelValue.gruplar"
      :items="gruplar"
      item-title="isim"
      item-value="id"
      label="Gruplar"
      multiple
      chips
      variant="outlined"
      density="compact"
      class="mb-4"
      return-object
    />
    
    <div class="text-h6 mb-4">Pozisyonlar</div>
    <div class="position-grid mb-4">
      <div class="position-background">
        <!-- Forvet -->
        <div class="position-row">
          <div class="position-cell">
            <div class="position-label">ST</div>
            <VSelect
              v-model="modelValue.pozisyonlar['ST']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['ST'])"
            />
          </div>
        </div>
        
        <!-- Ofansif Orta Saha -->
        <div class="position-row">
          <div class="position-cell">
            <div class="position-label">LW</div>
            <VSelect
              v-model="modelValue.pozisyonlar['LW']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['LW'])"
            />
          </div>
          <div class="position-cell">
            <div class="position-label">OOS</div>
            <VSelect
              v-model="modelValue.pozisyonlar['OOS']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['OOS'])"
            />
          </div>
          <div class="position-cell">
            <div class="position-label">RW</div>
            <VSelect
              v-model="modelValue.pozisyonlar['RW']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['RW'])"
            />
          </div>
        </div>

        <!-- Orta Saha -->
        <div class="position-row">
          <div class="position-cell">
            <div class="position-label">CM</div>
            <VSelect
              v-model="modelValue.pozisyonlar['CM']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['CM'])"
            />
          </div>
        </div>

        <!-- Defansif Orta Saha -->
        <div class="position-row">
          <div class="position-cell">
            <div class="position-label">DM</div>
            <VSelect
              v-model="modelValue.pozisyonlar['DM']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['DM'])"
            />
          </div>
        </div>

        <!-- Defans -->
        <div class="position-row">
          <div class="position-cell">
            <div class="position-label">DL</div>
            <VSelect
              v-model="modelValue.pozisyonlar['DL']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['DL'])"
            />
          </div>
          <div class="position-cell">
            <div class="position-label">DC</div>
            <VSelect
              v-model="modelValue.pozisyonlar['DC']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['DC'])"
            />
          </div>
          <div class="position-cell">
            <div class="position-label">DR</div>
            <VSelect
              v-model="modelValue.pozisyonlar['DR']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['DR'])"
            />
          </div>
        </div>

        <!-- Kaleci -->
        <div class="position-row justify-center">
          <div class="position-cell">
            <div class="position-label">GK</div>
            <VSelect
              v-model="modelValue.pozisyonlar['GK']"
              :items="pozisyonSeviyeleri"
              density="compact"
              hide-details
              class="position-select"
              :class="getPozisyonClass(modelValue.pozisyonlar['GK'])"
            />
          </div>
        </div>
      </div>
    </div>
  </VForm>

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
          @click="handleCropperSave"
        >
          Kırp
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import type { Grup } from '@/services/api'
import 'cropperjs/dist/cropper.css'
import { onMounted, ref } from 'vue'
import VueCropper from 'vue-cropperjs'

interface Props {
  modelValue: {
    id?: number
    adSoyad: string
    resim?: string
    gruplar: Grup[]
    pozisyonlar: { [key: string]: number }
  }
  gruplar: Grup[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const showCropper = ref(false)
const cropperRef = ref()
const cropperImage = ref('')

const adSoyadKurallari = [
  (v: string) => !!v?.trim() || 'Ad Soyad alanı zorunludur',
  (v: string) => v?.trim().length >= 2 || 'Ad Soyad en az 2 karakter olmalıdır'
]

const pozisyonSeviyeleri = [
  { value: 1, title: 'Çok Zayıf' },
  { value: 2, title: 'Zayıf' },
  { value: 3, title: 'Orta' },
  { value: 4, title: 'İyi' },
  { value: 5, title: 'Çok İyi' }
]

const getPozisyonClass = (seviye?: number) => {
  if (seviye === undefined || seviye === 1) return 'level-1'
  if (seviye === 2) return 'level-2'
  if (seviye === 3) return 'level-3'
  if (seviye === 4) return 'level-4'
  if (seviye === 5) return 'level-5'
  return 'level-1'
}

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

const handleCropperSave = () => {
  if (!cropperRef.value) return;

  // Yeni bir canvas oluştur (150x150)
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 150;
  const ctx = canvas.getContext('2d');

  // Kırpılmış resmi al
  const croppedCanvas = cropperRef.value.getCroppedCanvas();

  // Resmi 150x150 boyutuna ölçekle
  ctx?.drawImage(croppedCanvas, 0, 0, 150, 150);

  // WEBP formatına çevir
  const base64Image = canvas.toDataURL('image/webp', 0.7);
  
  // Modeli güncelle
  emit('update:modelValue', {
    ...props.modelValue,
    resim: base64Image
  });

  // Dialog'u kapat
  showCropper.value = false;
};

const validate = async () => {
  return await formRef.value?.validate()
}

const initializePozisyonlar = () => {
  const pozisyonlar: { [key: string]: number } = {
    ST: 1,
    LW: 1,
    OOS: 1,
    RW: 1,
    CM: 1,
    DM: 1,
    DL: 1,
    DC: 1,
    DR: 1,
    GK: 1
  }

  if (props.modelValue.pozisyonlar) {
    Object.entries(pozisyonlar).forEach(([key, _]) => {
      if (props.modelValue.pozisyonlar[key]) {
        pozisyonlar[key] = props.modelValue.pozisyonlar[key]
      }
    })
  }

  emit('update:modelValue', {
    ...props.modelValue,
    pozisyonlar
  })
}

onMounted(() => {
  initializePozisyonlar()
})

defineExpose({
  validate
})
</script>

<style scoped>
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

.position-select.level-1 :deep(.v-field) {
  background: rgba(255, 0, 0, 0.85) !important;
  color: white !important;
}

.position-select.level-2 :deep(.v-field) {
  background: rgba(255, 165, 0, 0.85) !important;
  color: white !important;
}

.position-select.level-3 :deep(.v-field) {
  background: rgba(255, 255, 0, 0.85) !important;
  color: black !important;
}

.position-select.level-4 :deep(.v-field) {
  background: rgba(46, 125, 50, 0.85) !important;
  color: white !important;
}

.position-select.level-5 :deep(.v-field) {
  background: rgba(102, 187, 106, 0.85) !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.4);
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
</style> 
