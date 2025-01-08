import axios from 'axios';

const API_URL = '/api';

export interface Oyuncu {
  id: number;
  adSoyad: string;
  pozisyon: string;
  resim?: string;
  yetenekler?: {
    [key: string]: number;
  };
  guc?: number;
}

export interface Formasyon {
  id: number;
  isim: string;
  pozisyonlar: {
    GK: number; // Kaleci her zaman 1 olacak
    ST?: number;
    LW?: number;
    RW?: number;
    CM?: number;
    DM?: number;
    LB?: number;
    CB?: number;
    RB?: number;
  };
  created_at?: string;
  updated_at?: string;
}

interface Pozisyon {
  kod: string
  isim: string
}

const api = {
  // Tüm oyuncuları getir
  getOyuncular: async (): Promise<Oyuncu[]> => {
    const response = await axios.get(`${API_URL}/oyuncular`);
    return response.data;
  },

  // Yeni oyuncu ekle
  createOyuncu: async (oyuncu: Omit<Oyuncu, 'id'>): Promise<Oyuncu> => {
    const response = await axios.post(`${API_URL}/oyuncular`, oyuncu);
    return response.data;
  },

  // Oyuncu güncelle
  updateOyuncu: async (id: number, oyuncu: Partial<Oyuncu>): Promise<Oyuncu> => {
    const response = await axios.put(`${API_URL}/oyuncular/${id}`, oyuncu);
    return response.data;
  },

  // Oyuncu sil
  deleteOyuncu: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/oyuncular/${id}`);
  },

  // Formasyon metodları
  getFormasyonlar: async () => {
    const response = await axios.get(`${API_URL}/formasyonlar`);
    return response.data;
  },

  createFormasyon: async (formasyon: Omit<Formasyon, 'id'>) => {
    // Kaleci pozisyonunu otomatik olarak ekle
    const formasyonWithGK = {
      ...formasyon,
      pozisyonlar: {
        ...formasyon.pozisyonlar,
        GK: 1 // Her formasyonda 1 kaleci
      }
    };
    const response = await axios.post(`${API_URL}/formasyonlar`, formasyonWithGK);
    return response.data;
  },

  getPozisyonlar: async (): Promise<Pozisyon[]> => {
    const response = await axios.get(`${API_URL}/pozisyonlar`)
    return response.data
  },
};

export default api; 
