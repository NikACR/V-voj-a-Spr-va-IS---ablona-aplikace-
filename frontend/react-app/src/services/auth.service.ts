// src/services/auth.service.ts
import api from '../utils/api';

export const login = (email: string, password: string) => {
  return api.post('auth/login', { email, password });
};

export const register = (email: string, password: string, name: string) => {
  return api.post('auth/register', { email, password, name });
};

export const refreshToken = (token: string) => {
  return api.post('auth/refresh', { refresh_token: token });
};

export const fetchUser = () => {
  return api.get('auth/me');
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return api.post('auth/logout');
};
