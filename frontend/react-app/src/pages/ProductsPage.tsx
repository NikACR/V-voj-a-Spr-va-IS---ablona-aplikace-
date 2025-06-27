// src/pages/ProductsPage.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

type MenuItem = {
  id_menu_polozka: number;
  nazev:           string;
  popis:           string;
  cena:            number;
};

const ProductsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [items,  setItems]   = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // 1) Počkáme, až skončí načítání auth a uživatel bude definovaný
    if (authLoading) return;
    if (!user) return;

    api.get<MenuItem[]>('/menu')
      .then(res => setItems(res.data))
      .catch(err => {
        // Pokud backend vrátí JSON.message, ukážeme ho, jinak err.message
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  // 2) Zatímco čekáme na auth nebo na data:
  if (authLoading || loading) {
    return <p className="text-center mt-8">Načítám nabídku…</p>;
  }
  // 3) Pokud není user, přesměruj na login:
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // 4) Pokud se fetch nezdařil:
  if (error) {
    return <p className="text-red-500 text-center mt-8">Chyba: {error}</p>;
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Naše nabídka</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(i => (
          <li key={i.id_menu_polozka} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-xl">{i.nazev}</h2>
            <p className="mt-2">{i.popis}</p>
            <p className="mt-4 font-bold">{i.cena} Kč</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;
