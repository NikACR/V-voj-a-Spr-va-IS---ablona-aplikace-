// src/pages/HomePage.tsx
import React, { useState } from 'react'
import ProduktKarta from '../components/ProduktKarta'

const HomePage: React.FC = () => {
  const produkty = [
    { nazev: 'Pizza Margherita', cena: 129, popis: 'Klasická pizza s rajčaty a mozzarellou.' },
    { nazev: 'Čokoládový dort',  cena: 79,  popis: 'Čokoládový dezert bez obrázku.' },
  ]
  const [zobrazitDalsiInfo, setZobrazitDalsiInfo] = useState(false)

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">
        Vítejte v naší restauraci!
      </h1>
      <p className="mb-6 text-gray-700">
        Tady uvidíte všechno, po čem vaše chutě touží.
      </p>

      <button
        onClick={() => setZobrazitDalsiInfo(!zobrazitDalsiInfo)}
        className="
          px-4 py-2
          bg-white text-black border
          rounded mb-4
          hover:bg-gray-100
          transition-colors
        "
      >
        {zobrazitDalsiInfo ? 'Skrýt info' : 'Zobrazit info'}
      </button>

      {zobrazitDalsiInfo && (
        <p className="mb-6 text-gray-700">
          Komponenta <strong className="text-gray-900">ProduktKarta</strong> přijímá props
          (nazev, cena, popis a volitelně obrazekUrl) a demonstruje použití <code className="bg-gray-100 text-gray-800 px-1 rounded">useState</code>.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {produkty.map((p, i) => (
          <ProduktKarta
            key={i}
            nazev={p.nazev}
            cena={p.cena}
            popis={p.popis}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage
