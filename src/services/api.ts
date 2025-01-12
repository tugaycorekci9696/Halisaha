import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Grup {
  id: number;
  isim: string;
  oyuncuSayisi: number;
  duzenleniyor?: boolean;
  yeniIsim?: string;
}

export interface OyuncuOzelligi {
  id: number;
  isim: string;
}

export interface OyuncuYetenek {
  ozellik_id: number;
  seviye: number;
}

export interface Oyuncu {
  id: number;
  adSoyad: string;
  resim?: string;
  guc?: number;
  pozisyonlar?: {
    [key: string]: number;
  };
  gruplar?: Grup[];
  yetenekler?: string[];
}

export interface MevkiKatsayi {
  mevki: string
  yetenek: string
  katsayi: number
  toplam_katsayi: number
}

// Oyuncular
export const getOyuncular = async (): Promise<Oyuncu[]> => {
  const response = await axios.get(`${API_URL}/oyuncular`);
  return response.data;
};

export const createOyuncu = async (oyuncu: Omit<Oyuncu, 'id'>): Promise<Oyuncu> => {
  const response = await axios.post(`${API_URL}/oyuncular`, oyuncu);
  return response.data;
};

export const updateOyuncu = async (id: number, oyuncu: Partial<Oyuncu>): Promise<Oyuncu> => {
  const response = await axios.put(`${API_URL}/oyuncular/${id}`, oyuncu);
  return response.data;
};

export const deleteOyuncu = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/oyuncular/${id}`);
};

// Gruplar
export const getGruplar = async (): Promise<Grup[]> => {
  const response = await axios.get(`${API_URL}/gruplar`);
  return response.data;
};

export const createGrup = async (grup: Omit<Grup, 'id' | 'oyuncuSayisi'>): Promise<Grup> => {
  const response = await axios.post(`${API_URL}/gruplar`, grup);
  return response.data;
};

export const updateGrup = async (id: number, grup: Partial<Grup>): Promise<Grup> => {
  const response = await axios.put(`${API_URL}/gruplar/${id}`, grup);
  return response.data;
};

export const deleteGrup = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/gruplar/${id}`);
};

export const updateOyuncuGruplari = async (oyuncuId: number, grupIds: number[]): Promise<void> => {
  await axios.put(`${API_URL}/oyuncular/${oyuncuId}/gruplar`, { grupIds });
};

// Yetenekler
export const getOyuncuOzellikleri = async (): Promise<OyuncuOzelligi[]> => {
  const response = await axios.get(`${API_URL}/oyuncu-ozellikleri`);
  return response.data;
};

export const getOyuncuYetenekleri = async (oyuncuId: number): Promise<OyuncuYetenek[]> => {
  const response = await axios.get(`${API_URL}/oyuncular/${oyuncuId}/yetenekler`);
  return response.data;
};

export const updateOyuncuYetenekleri = async (oyuncuId: number, yetenekler: OyuncuYetenek[]): Promise<void> => {
  await axios.put(`${API_URL}/oyuncular/${oyuncuId}/yetenekler`, { yetenekler });
};

// Yeni fonksiyonlar
export const executeQueryById = async (oyuncuId: number, q_id: number): Promise<number> => {
  const response = await axios.post(`${API_URL}/execute-query`, { oyuncuId, q_id });
  return response.data.result;
};

export const updateYeniPozisyonlar = async (oyuncuId: number, pozisyonlar: { [key: string]: number }): Promise<any> => {
  console.log('API - updateYeniPozisyonlar çağrıldı:', { oyuncuId, pozisyonlar });
  const response = await axios.put(`${API_URL}/yeni-pozisyonlar/${oyuncuId}`, pozisyonlar);
  console.log('API - updateYeniPozisyonlar yanıtı:', response.data);
  return response.data;
};

export interface Api {
  getOyuncular(): Promise<Oyuncu[]>
  createOyuncu(oyuncu: Omit<Oyuncu, 'id'>): Promise<Oyuncu>
  updateOyuncu(id: number, oyuncu: Partial<Oyuncu>): Promise<Oyuncu>
  deleteOyuncu(id: number): Promise<void>
  getGruplar(): Promise<Grup[]>
  createGrup(grup: Omit<Grup, 'id'>): Promise<Grup>
  updateGrup(id: number, grup: Partial<Grup>): Promise<Grup>
  deleteGrup(id: number): Promise<void>
  updateOyuncuGruplari(oyuncuId: number, grupIds: number[]): Promise<void>
  getOyuncuOzellikleri(): Promise<OyuncuOzelligi[]>
  getOyuncuYetenekleri(oyuncuId: number): Promise<OyuncuYetenek[]>
  updateOyuncuYetenekleri(oyuncuId: number, yetenekler: OyuncuYetenek[]): Promise<void>
  getMevkiKatsayilari(mevki: string): Promise<MevkiKatsayi[]>
  executeQueryById(oyuncuId: number, q_id: number): Promise<number>
  updateYeniPozisyonlar(oyuncuId: number, pozisyonlar: { [key: string]: number }): Promise<any>
}

const api: Api = {
  async getOyuncular(): Promise<Oyuncu[]> {
    const response = await fetch(`${API_URL}/oyuncular`)
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async createOyuncu(oyuncu: Omit<Oyuncu, 'id'>): Promise<Oyuncu> {
    const response = await fetch(`${API_URL}/oyuncular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oyuncu)
    })
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async updateOyuncu(id: number, oyuncu: Partial<Oyuncu>): Promise<Oyuncu> {
    const response = await fetch(`${API_URL}/oyuncular/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oyuncu)
    })
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async deleteOyuncu(id: number): Promise<void> {
    await fetch(`${API_URL}/oyuncular/${id}`, {
      method: 'DELETE'
    })
  },
  async getGruplar(): Promise<Grup[]> {
    const response = await fetch(`${API_URL}/gruplar`)
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async createGrup(grup: Omit<Grup, 'id'>): Promise<Grup> {
    const response = await fetch(`${API_URL}/gruplar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grup)
    })
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async updateGrup(id: number, grup: Partial<Grup>): Promise<Grup> {
    const response = await fetch(`${API_URL}/gruplar/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grup)
    })
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async deleteGrup(id: number): Promise<void> {
    await fetch(`${API_URL}/gruplar/${id}`, {
      method: 'DELETE'
    })
  },
  async updateOyuncuGruplari(oyuncuId: number, grupIds: number[]): Promise<void> {
    await fetch(`${API_URL}/oyuncular/${oyuncuId}/gruplar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grupIds })
    })
  },
  async getOyuncuOzellikleri(): Promise<OyuncuOzelligi[]> {
    const response = await fetch(`${API_URL}/oyuncu-ozellikleri`)
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async getOyuncuYetenekleri(oyuncuId: number): Promise<OyuncuYetenek[]> {
    const response = await fetch(`${API_URL}/oyuncular/${oyuncuId}/yetenekler`)
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async updateOyuncuYetenekleri(oyuncuId: number, yetenekler: OyuncuYetenek[]): Promise<void> {
    await fetch(`${API_URL}/oyuncular/${oyuncuId}/yetenekler`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yetenekler })
    })
  },
  async getMevkiKatsayilari(mevki: string): Promise<MevkiKatsayi[]> {
    const response = await fetch(`${API_URL}/mevki-katsayilari/${mevki}`)
    if (!response.ok) throw new Error('Mevki katsayıları alınamadı')
    return response.json()
  },
  async executeQueryById(oyuncuId: number, q_id: number): Promise<number> {
    const response = await fetch(`${API_URL}/execute-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ oyuncuId, q_id })
    })
    if (!response.ok) throw new Error('Query çalıştırılamadı')
    const data = await response.json()
    return data.result
  },
  async updateYeniPozisyonlar(oyuncuId: number, pozisyonlar: { [key: string]: number }): Promise<any> {
    console.log('API - updateYeniPozisyonlar çağrıldı:', { oyuncuId, pozisyonlar });
    const response = await axios.put(`${API_URL}/yeni-pozisyonlar/${oyuncuId}`, pozisyonlar);
    console.log('API - updateYeniPozisyonlar yanıtı:', response.data);
    return response.data;
  },
  async getYeniPozisyonlar(oyuncuId: number): Promise<{ [key: string]: number }> {
    console.log('API - getYeniPozisyonlar çağrıldı:', { oyuncuId });
    try {
      const response = await axios.get(`${API_URL}/yeni-pozisyonlar/${oyuncuId}`);
      console.log('API - getYeniPozisyonlar yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('API - getYeniPozisyonlar hatası:', error);
      return {};
    }
  }
}

export default {
  getOyuncular,
  createOyuncu,
  updateOyuncu,
  deleteOyuncu,
  getGruplar,
  createGrup,
  updateGrup,
  deleteGrup,
  updateOyuncuGruplari,
  getOyuncuOzellikleri,
  getOyuncuYetenekleri,
  updateOyuncuYetenekleri,
  executeQueryById,
  updateYeniPozisyonlar,
  getMevkiKatsayilari: api.getMevkiKatsayilari,
  getYeniPozisyonlar: api.getYeniPozisyonlar
}; 
