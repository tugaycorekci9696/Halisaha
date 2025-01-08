export interface Oyuncu {
  id: number
  adSoyad: string
  resim?: string
  guc?: number
  pozisyonlar?: {
    [key: string]: number
  }
}

export interface Formasyon {
  id: number
  isim: string
  pozisyonlar: {
    [key: string]: number
  }
} 
