// src/components/ProductCard.tsx

import React from 'react';
import placeholder from '../assets/placeholder.png';

interface Allergen {
  id_alergenu: number;
  nazev: string;
}

interface ProductCardProps {
  title: string;
  imageUrl: string | null;    // např. "pizza.jpg" nebo full URL
  description: string;
  price: number | string;
  allergens: Allergen[];
  preparation: number;
  points: number;
  onAdd: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  imageUrl,
  description,
  price,
  allergens,
  preparation,
  points,
  onAdd,
}) => {
  // Převedeme price na číslo
  const priceNumber = typeof price === 'number' ? price : parseFloat(price);
  const displayPrice = isNaN(priceNumber) ? '0.00' : priceNumber.toFixed(2);

  // Vezmeme jen název souboru z imageUrl
  const filename = imageUrl
    ? imageUrl.split('/').pop()  // vezme "pizza.jpg" i z "static/images/pizza.jpg" nebo full URL
    : null;

  // Cesta, kterou proxy přepošle na backend
  const imgSrc = filename
    ? `/static/images/${filename}`
    : placeholder;

  return (
    <div className="border rounded-2xl shadow-sm overflow-hidden flex flex-col bg-white">
      {/* Obrázek */}
      <div className="h-48 bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.src = placeholder; }}
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-xl mb-1">{title}</h3>
        <p className="text-gray-600 text-sm flex-1">{description}</p>

        <div className="mt-2 space-x-1">
          {allergens.map(a => (
            <span
              key={a.id_alergenu}
              className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700"
            >
              {a.nazev}
            </span>
          ))}
        </div>

        <div className="text-gray-500 text-sm mt-2">
          Příprava: {preparation} min | Body: {points}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-lg">{displayPrice} Kč</span>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Přidat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
