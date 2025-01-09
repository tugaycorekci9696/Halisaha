import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Grup {
  id: number;
  isim: string;
  oyuncuSayisi: number;
  duzenleniyor?: boolean;
  yeniIsim?: string;
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

export default {
  getOyuncular,
  createOyuncu,
  updateOyuncu,
  deleteOyuncu,
  getGruplar,
  createGrup,
  updateGrup,
  deleteGrup,
  updateOyuncuGruplari
}; 
