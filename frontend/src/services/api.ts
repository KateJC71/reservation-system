import axios from 'axios';
import { 
  User, 
  Equipment, 
  Reservation, 
  LoginRequest, 
  RegisterRequest, 
  CreateReservationRequest,
  AuthResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 身份驗證 API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

// 雪具 API
export const equipmentAPI = {
  getAll: async (params?: { category?: string; size?: string }): Promise<Equipment[]> => {
    const response = await api.get('/equipment', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/equipment/categories/list');
    return response.data;
  },
  
  getSizes: async (): Promise<string[]> => {
    const response = await api.get('/equipment/sizes/list');
    return response.data;
  },
};

// 預約 API
export const reservationAPI = {
  create: async (data: CreateReservationRequest): Promise<{ message: string; reservation_id: number; total_price: number }> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },
  
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/my');
    return response.data;
  },
  
  cancel: async (id: number): Promise<{ message: string }> => {
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data;
  },
};

export async function submitReservation(data: any) {
  const res = await fetch('/api/reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('送出失敗');
  return res.json();
}

export default api; 