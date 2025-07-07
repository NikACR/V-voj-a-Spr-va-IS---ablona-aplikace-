// src/pages/ProductsPage.tsx

import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

interface Allergen {
  id_alergenu: number;
  nazev: string;
}

interface MenuItem {
  id: number;
  nazev: string;
  popis: string;
  cena: number;
  imageUrl: string;
  alergeny: Allergen[];
  priprava: number;
  body: number;
}

// Natvrdo: týdenní nabídka (3 položky)
const WEEKLY_ITEMS: MenuItem[] = [
  {
    id: 1,
    nazev: 'Sýrová pizza',
    popis: 'italská pizza',
    cena: 199,
    imageUrl: '/static/images/pizza.jpg',
    alergeny: [],
    priprava: 15,
    body: 5,
  },
  {
    id: 2,
    nazev: 'Hovězí burger',
    popis: 'burger s hranolkami',
    cena: 249,
    imageUrl: '/static/images/hoveziburger.jpg',
    alergeny: [],
    priprava: 20,
    body: 8,
  },
  {
    id: 3,
    nazev: 'Caesar salát',
    popis: 'čerstvý salát',
    cena: 159,
    imageUrl: '/static/images/caesar.jpg',
    alergeny: [],
    priprava: 10,
    body: 4,
  },
];

// Natvrdo: stálá nabídka (18 položek)
const PERMANENT_ITEMS: MenuItem[] = [
  {
    id: 4,
    nazev: 'Cordon bleu',
    popis: 'medová šunka, čedar, smetanová kaše, rajčatový salát',
    cena: 319,
    imageUrl: '/static/images/cordon.jpg',
    alergeny: [],
    priprava: 22,
    body: 9,
  },
  {
    id: 5,
    nazev: 'Vepřová žebra',
    popis: 'domácí BBQ omáčka, čerstvý křen, sádlová houska',
    cena: 359,
    imageUrl: '/static/images/zebra.jpg',
    alergeny: [],
    priprava: 30,
    body: 10,
  },
  {
    id: 6,
    nazev: 'Ball tip steak',
    popis: 'pečené brambory, pepřová nebo lanýžová omáčka',
    cena: 429,
    imageUrl: '/static/images/balltipsteak.jpg',
    alergeny: [],
    priprava: 25,
    body: 9,
  },
  {
    id: 7,
    nazev: 'Focaccia',
    popis: 'bryndza, čerstvé klíčky',
    cena:  99,
    imageUrl: '/static/images/focaccia.jpg',
    alergeny: [],
    priprava: 12,
    body: 3,
  },
  {
    id: 8,
    nazev: 'Kulajda',
    popis: 'opékané brambory, zastřené vejce, čerstvý kopr',
    cena: 109,
    imageUrl: '/static/images/kulajda.jpg',
    alergeny: [],
    priprava: 18,
    body: 6,
  },
  {
    id: 9,
    nazev: 'Hovězí tatarák',
    popis: 'kapary, lanýžové máslo, parmezán, křupavý toast',
    cena: 239,
    imageUrl: '/static/images/tatarak.jpg',
    alergeny: [],
    priprava:  5,
    body: 7,
  },
  {
    id: 10,
    nazev: 'Římský salát',
    popis: 'cherry rajčata, gorgonzola, javorový sirup, slanina',
    cena: 199,
    imageUrl: '/static/images/rimskysalat.jpg',
    alergeny: [],
    priprava: 10,
    body: 4,
  },
  {
    id: 11,
    nazev: 'Svíčková',
    popis: 'hovězí svíčková, houskový knedlík, brusinky, omáčka',
    cena: 329,
    imageUrl: '/static/images/svickova.jpg',
    alergeny: [],
    priprava: 25,
    body: 10,
  },
  {
    id: 12,
    nazev: 'Bramborové noky',
    popis: 'pesto, sušená rajčata, parmezán, piniové oříšky',
    cena: 239,
    imageUrl: '/static/images/bramborovenoky.jpg',
    alergeny: [],
    priprava: 14,
    body: 5,
  },
  {
    id: 13,
    nazev: 'Vepřová panenka',
    popis: 'gratinované brambory, demi-glace, rukola, ředkev',
    cena: 329,
    imageUrl: '/static/images/panenka.jpg',
    alergeny: [],
    priprava: 22,
    body: 9,
  },
  {
    id: 14,
    nazev: 'Řízek',
    popis: 'kuřecí řízek v panko strouhance, bramborová kaše',
    cena: 155,
    imageUrl: '/static/images/rizek.jpg',
    alergeny: [],
    priprava: 18,
    body: 6,
  },
  {
    id: 15,
    nazev: 'Burger s trhaným vepřovým',
    popis: 'domácí bulky, trhané vepřové maso, BBQ omáčka, sýr',
    cena: 259,
    imageUrl: '/static/images/trhanyburger.jpg',
    alergeny: [],
    priprava: 20,
    body: 8,
  },
  {
    id: 16,
    nazev: 'Buchty jako od babičky',
    popis: 'buchtičky s vanilkovým krémem a ovocem',
    cena: 169,
    imageUrl: '/static/images/buchty.jpg',
    alergeny: [],
    priprava: 30,
    body: 5,
  },
  {
    id: 17,
    nazev: 'Paris-Brest',
    popis: 'odpalované těsto s pekanovými ořechy a krémem',
    cena: 119,
    imageUrl: '/static/images/parisbrest.jpg',
    alergeny: [],
    priprava: 28,
    body: 6,
  },
  {
    id: 18,
    nazev: 'Crème brûlée',
    popis: 'vanilkový krém s karamelem',
    cena:  59,
    imageUrl: '/static/images/cremebrulee.jpg',
    alergeny: [],
    priprava: 15,
    body: 4,
  },
  {
    id: 19,
    nazev: 'Craquelin',
    popis: 'větrník se slaným karamelem',
    cena:  65,
    imageUrl: '/static/images/craquelin.jpg',
    alergeny: [],
    priprava: 25,
    body: 5,
  },
  {
    id: 20,
    nazev: 'Bounty cheesecake',
    popis: 'čokoládový dort s kokosem a sušenkovým základem',
    cena:  79,
    imageUrl: '/static/images/bountycheesecake.jpg',
    alergeny: [],
    priprava: 20,
    body: 4,
  },
  {
    id: 21,
    nazev: 'Malinové brownies',
    popis: 'kakaové brownies s čerstvými malinami',
    cena:  75,
    imageUrl: '/static/images/malinovebrownies.jpg',
    alergeny: [],
    priprava: 20,
    body: 4,
  },
];

const ProductsPage: React.FC = () => {
  const [view, setView] = useState<0 | 1>(0);
  const { add } = useCart();

  const itemsToShow = view === 0 ? WEEKLY_ITEMS : PERMANENT_ITEMS;

  return (
    <div className="p-4 space-y-6">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setView(0)}
          className={`px-4 py-2 rounded-lg transition ${
            view === 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Týdenní nabídka
        </button>
        <button
          onClick={() => setView(1)}
          className={`px-4 py-2 rounded-lg transition ${
            view === 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Stálá nabídka
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsToShow.map(item => (
          <ProductCard
            key={item.id}
            title={item.nazev}
            imageUrl={item.imageUrl}
            description={item.popis}
            price={item.cena}
            allergens={item.alergeny}
            preparation={item.priprava}
            points={item.body}
            onAdd={() => add({
              id:       item.id,
              title:    item.nazev,
              price:    item.cena,
              prepTime: item.priprava,
              points:   item.body
            })}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
