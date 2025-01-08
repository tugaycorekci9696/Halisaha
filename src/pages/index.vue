<template>
  <div>
    <VRow>
      <!-- Oyuncu Havuzu -->
      <VCol cols="12" md="4">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <span>Oyuncu Havuzu 🏃</span>
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

      <!-- Takımlar -->
      <VCol cols="12" md="8">
        <VRow>
          <!-- Takım A -->
          <VCol cols="12" lg="6">
            <VCard>
              <VCardTitle class="d-flex align-center justify-space-between">
                <VTextField
                  v-model="takimA.isim"
                  variant="underlined"
                  hide-details
                  density="compact"
                  class="takim-ismi"
                />
                <VSelect
                  v-model="takimA.formasyon"
                  :items="formasyonlar"
                  item-title="isim"
                  item-value="id"
                  variant="underlined"
                  hide-details
                  density="compact"
                  class="formasyon-select"
                  label="Formasyon"
                  @update:model-value="formasyonDegistir('A', $event)"
                />
              </VCardTitle>
              <VCardText>
                <div class="saha"
                     @dragover.prevent
                     @drop="dropOnSaha($event, 'A')">
                  <!-- Forvet -->
                  <div class="saha-row">
                    <div v-for="i in 3" :key="'ST-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'ST', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'ST', i)">
                      <template v-if="getPozisyonOyuncu('A', 'ST', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'ST', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'ST', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'ST', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'ST', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'ST', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'ST', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">ST</span>
                    </div>
                  </div>
                  <!-- Kanat ve OOS -->
                  <div class="saha-row">
                    <div v-for="i in 2" :key="'LW-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'LW', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'LW', i)">
                      <template v-if="getPozisyonOyuncu('A', 'LW', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'LW', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'LW', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'LW', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'LW', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'LW', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'LW', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">LW</span>
                    </div>
                    <div v-for="i in 3" :key="'OOS-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'OOS', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'OOS', i)">
                      <template v-if="getPozisyonOyuncu('A', 'OOS', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'OOS', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'OOS', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'OOS', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'OOS', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'OOS', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'OOS', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">OOS</span>
                    </div>
                    <div v-for="i in 2" :key="'RW-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'RW', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'RW', i)">
                      <template v-if="getPozisyonOyuncu('A', 'RW', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'RW', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'RW', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'RW', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'RW', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'RW', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'RW', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">RW</span>
                    </div>
                  </div>
                  <!-- Orta Saha -->
                  <div class="saha-row">
                    <div v-for="i in 3" :key="'CM-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'CM', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'CM', i)">
                      <template v-if="getPozisyonOyuncu('A', 'CM', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'CM', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'CM', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'CM', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'CM', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'CM', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'CM', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">CM</span>
                    </div>
                  </div>
                  <!-- Defansif Orta Saha -->
                  <div class="saha-row">
                    <div v-for="i in 2" :key="'DM-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'DM', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'DM', i)">
                      <template v-if="getPozisyonOyuncu('A', 'DM', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'DM', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'DM', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'DM', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'DM', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'DM', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'DM', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DM</span>
                    </div>
                  </div>
                  <!-- Defans -->
                  <div class="saha-row">
                    <div v-for="i in 2" :key="'DL-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'DL', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'DL', i)">
                      <template v-if="getPozisyonOyuncu('A', 'DL', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'DL', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'DL', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'DL', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'DL', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'DL', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'DL', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DL</span>
                    </div>
                    <div v-for="i in 2" :key="'DC-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'DC', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'DC', i)">
                      <template v-if="getPozisyonOyuncu('A', 'DC', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'DC', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'DC', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'DC', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'DC', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'DC', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'DC', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DC</span>
                    </div>
                    <div v-for="i in 2" :key="'DR-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'DR', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'DR', i)">
                      <template v-if="getPozisyonOyuncu('A', 'DR', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'DR', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'DR', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'DR', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'DR', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'DR', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'DR', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DR</span>
                    </div>
                  </div>
                  <!-- Kaleci -->
                  <div class="saha-row">
                    <div v-for="i in 1" :key="'GK-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('A', 'GK', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'A', 'GK', i)">
                      <template v-if="getPozisyonOyuncu('A', 'GK', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'A', 'GK', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('A', 'GK', i)?.resim" 
                                 :src="getPozisyonOyuncu('A', 'GK', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('A', 'GK', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('A', 'GK', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('A', 'GK', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">GK</span>
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Takım B -->
          <VCol cols="12" lg="6">
            <VCard>
              <VCardTitle class="d-flex align-center justify-space-between">
                <VTextField
                  v-model="takimB.isim"
                  variant="underlined"
                  hide-details
                  density="compact"
                  class="takim-ismi"
                />
                <VSelect
                  v-model="takimB.formasyon"
                  :items="formasyonlar"
                  item-title="isim"
                  item-value="id"
                  variant="underlined"
                  hide-details
                  density="compact"
                  class="formasyon-select"
                  label="Formasyon"
                  @update:model-value="formasyonDegistir('B', $event)"
                />
              </VCardTitle>
      <VCardText>
                <div class="saha"
                     @dragover.prevent
                     @drop="dropOnSaha($event, 'B')">
                  <!-- Forvet -->
                  <div class="saha-row">
                    <div v-for="i in 3" :key="'ST-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'ST', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'ST', i)">
                      <template v-if="getPozisyonOyuncu('B', 'ST', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'ST', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'ST', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'ST', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'ST', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'ST', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'ST', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">ST</span>
                    </div>
                  </div>
                  <!-- Kanat ve OOS -->
                  <div class="saha-row">
                    <div v-for="i in 2" :key="'LW-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'LW', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'LW', i)">
                      <template v-if="getPozisyonOyuncu('B', 'LW', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'LW', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'LW', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'LW', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'LW', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'LW', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'LW', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">LW</span>
                    </div>
                    <div v-for="i in 3" :key="'OOS-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'OOS', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'OOS', i)">
                      <template v-if="getPozisyonOyuncu('B', 'OOS', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'OOS', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'OOS', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'OOS', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'OOS', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'OOS', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'OOS', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">OOS</span>
                    </div>
                    <div v-for="i in 2" :key="'RW-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'RW', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'RW', i)">
                      <template v-if="getPozisyonOyuncu('B', 'RW', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'RW', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'RW', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'RW', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'RW', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'RW', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'RW', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">RW</span>
                    </div>
                  </div>
                  <!-- Orta Saha -->
                  <div class="saha-row">
                    <div v-for="i in 3" :key="'CM-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'CM', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'CM', i)">
                      <template v-if="getPozisyonOyuncu('B', 'CM', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'CM', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'CM', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'CM', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'CM', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'CM', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'CM', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">CM</span>
                    </div>
                  </div>
                  <!-- Defansif Orta Saha -->
                  <div class="saha-row">
                    <div v-for="i in 2" :key="'DM-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'DM', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'DM', i)">
                      <template v-if="getPozisyonOyuncu('B', 'DM', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'DM', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'DM', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'DM', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'DM', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'DM', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'DM', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DM</span>
                    </div>
                  </div>
                  <!-- Defans -->
                  <div class="saha-row">
                    <div v-for="i in 2" :key="'DL-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'DL', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'DL', i)">
                      <template v-if="getPozisyonOyuncu('B', 'DL', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'DL', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'DL', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'DL', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'DL', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'DL', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'DL', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DL</span>
                    </div>
                    <div v-for="i in 2" :key="'DC-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'DC', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'DC', i)">
                      <template v-if="getPozisyonOyuncu('B', 'DC', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'DC', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'DC', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'DC', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'DC', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'DC', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'DC', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DC</span>
                    </div>
                    <div v-for="i in 2" :key="'DR-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'DR', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'DR', i)">
                      <template v-if="getPozisyonOyuncu('B', 'DR', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'DR', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'DR', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'DR', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'DR', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'DR', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'DR', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">DR</span>
                    </div>
                  </div>
                  <!-- Kaleci -->
                  <div class="saha-row">
                    <div v-for="i in 1" :key="'GK-'+i"
                         class="pozisyon-kutusu"
                         :class="{ 'dolu': getPozisyonOyuncu('B', 'GK', i) }"
                         @dragover.prevent
                         @drop="dropOnPozisyon($event, 'B', 'GK', i)">
                      <template v-if="getPozisyonOyuncu('B', 'GK', i)">
                        <div class="oyuncu-mini"
                             draggable="true"
                             @dragstart="(e) => dragStartPozisyon(e, 'B', 'GK', i)">
                          <VAvatar size="36">
                            <VImg v-if="getPozisyonOyuncu('B', 'GK', i)?.resim" 
                                 :src="getPozisyonOyuncu('B', 'GK', i)?.resim" />
                            <VIcon v-else icon="tabler-user" />
                          </VAvatar>
                          <div class="oyuncu-mini-bilgi">
                            <div class="text-caption">{{ getPozisyonOyuncu('B', 'GK', i)?.adSoyad }}</div>
                            <VChip :color="oyuncuGucRengi(getPozisyonOyuncu('B', 'GK', i)?.guc)" 
                                  size="x-small" class="mt-1">
                              {{ getPozisyonOyuncu('B', 'GK', i)?.guc }}
                            </VChip>
                          </div>
                        </div>
                      </template>
                      <span v-else class="pozisyon-text">GK</span>
                    </div>
                  </div>
                </div>
      </VCardText>
    </VCard>
          </VCol>
        </VRow>
      </VCol>
    </VRow>

    <!-- Formasyon Ekleme Dialog -->
    <VDialog v-model="formasyonDialog" max-width="500">
      <VCard>
        <VCardTitle>Yeni Formasyon Ekle</VCardTitle>
        <VCardText>
          <VTextField
            v-model="yeniFormasyon.isim"
            label="Formasyon Adı"
            placeholder="Örn: 4-3-3"
            class="mb-4"
          />
          
          <div class="pozisyon-secici">
            <div v-for="poz in pozisyonlar" :key="poz.kod" class="d-flex align-center mb-2">
              <VCheckbox
                v-model="yeniFormasyon.pozisyonlar[poz.kod]"
                :label="poz.isim"
                hide-details
                class="me-2"
              />
              <VTextField
                v-if="yeniFormasyon.pozisyonlar[poz.kod]"
                v-model="yeniFormasyon.adetler[poz.kod]"
                type="number"
                min="0"
                max="5"
                hide-details
                density="compact"
                style="width: 80px"
              />
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
  pozisyonlar: {} as { [key: string]: boolean },
  adetler: {} as { [key: string]: number }
})

const pozisyonlar = [
  { kod: 'GK', isim: 'Kaleci' },
  { kod: 'DL', isim: 'Sol Defans' },
  { kod: 'DC', isim: 'Stoper' },
  { kod: 'DR', isim: 'Sağ Defans' },
  { kod: 'DM', isim: 'Defansif Orta Saha' },
  { kod: 'CM', isim: 'Orta Saha' },
  { kod: 'OOS', isim: 'Ofansif Orta Saha' },
  { kod: 'LW', isim: 'Sol Kanat' },
  { kod: 'ST', isim: 'Forvet' },
  { kod: 'RW', isim: 'Sağ Kanat' }
]

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
  const takim = takimKodu === 'A' ? takimA : takimB
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
  // Takım A'yı sıfırla
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

  // Takım B'yi sıfırla
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
    pozisyonlar: {},
    adetler: {}
  }
  formasyonDialog.value = true
}

const formasyonKaydet = async () => {
  const pozisyonlarObj: { [key: string]: number } = {}
  
  for (const poz of pozisyonlar) {
    if (yeniFormasyon.value.pozisyonlar[poz.kod]) {
      pozisyonlarObj[poz.kod] = Number(yeniFormasyon.value.adetler[poz.kod]) || 0
    }
  }
  
  try {
    await api.createFormasyon({
      isim: yeniFormasyon.value.isim,
      pozisyonlar: pozisyonlarObj
    })
    
    await formasyonlariYukle()
    formasyonDialog.value = false
  } catch (error) {
    console.error('Formasyon kaydedilirken hata:', error)
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

onMounted(() => {
  oyunculariYukle()
  formasyonlariYukle()
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
  color: white;
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
}

.pozisyon-kutusu.dolu {
  background-color: rgba(0,0,0,0.1);
  border-style: solid;
}

.pozisyon-text {
  color: rgba(0,0,0,0.6);
  font-weight: bold;
}

.oyuncu-mini-bilgi {
  text-align: center;
  color: rgba(0,0,0,0.87);
  margin-top: 4px;
  font-size: 0.75rem;
}

.formasyon-select {
  max-width: 150px;
}

.pozisyon-secici {
  max-height: 400px;
  overflow-y: auto;
}
</style>
