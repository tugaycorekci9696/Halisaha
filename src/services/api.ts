import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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
    const response = await axios.get('/api/formasyonlar');
    return response.data;
  },

  createFormasyon: async (formasyon: Omit<Formasyon, 'id'>) => {
    const response = await axios.post('/api/formasyonlar', formasyon);
    return response.data;
  }
};

export default api; 
