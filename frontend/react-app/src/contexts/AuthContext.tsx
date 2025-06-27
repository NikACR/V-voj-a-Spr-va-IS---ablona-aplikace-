import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import api from '../utils/api';

export interface UserInfo {
  id_zakaznika: number;
  email:       string;
  jmeno:       string;
  prijmeni:    string;
  roles?:      string[];
}

interface AuthContextType {
  user:    UserInfo | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  logout:  () => void;
}

const AuthContext = createContext<AuthContextType>({
  user:    null,
  loading: false,
  login:   async () => {},
  logout:  () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get<UserInfo>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<{
        access_token:  string;
        refresh_token: string;
      }>('/auth/login', { email, password });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      await fetchUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
