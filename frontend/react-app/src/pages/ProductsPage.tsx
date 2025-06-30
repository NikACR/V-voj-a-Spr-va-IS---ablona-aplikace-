// src/pages/ProductsPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import SkeletonCard from '../components/SkeletonCard';

interface Product {
  id: number;
  nazev: string;
  popis: string;
  cena: number;
  alergeny: string[];
}

const ProductsPage: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    api.get<Product[]>('/menu')
      .then(res => setItems(res.data))
      .catch(() => setError('Nepodařilo se načíst nabídku.'))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} height="250px" />
          ))
        : items.map(item => (
            <div key={item.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{item.nazev}</h2>
              <p className="mb-2">{item.popis}</p>
              <p className="font-bold mb-2">{item.cena} Kč</p>
              {item.alergeny.length > 0 && (
                <div className="mb-2">
                  <span className="font-medium">Alergeny:</span>{' '}
                  {item.alergeny.map((a, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-1"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {/* tady můžeš otevřít modal rezervace */}}
                className="mt-2 bg-blue-600 text-white py-1 px-3 rounded"
              >
                Rezervovat
              </button>
            </div>
          ))}
    </div>
  );
};

export default ProductsPage;
