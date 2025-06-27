import React from 'react';

interface ProduktKartaProps {
  nazev: string;
  cena: number;
  popis: string;
  obrazekUrl?: string;
}

const ProduktKarta: React.FC<ProduktKartaProps> = ({ nazev, cena, popis, obrazekUrl }) => {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow p-6 max-w-sm">
      {obrazekUrl && (
        <img
          src={obrazekUrl}
          alt={nazev}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{nazev}</h3>
      <p className="text-gray-800 font-bold mb-2">{cena} Kč</p>
      <p className="text-gray-700 flex-grow">{popis}</p>
      <button className="btn-primary mt-4">
        Rezervovat
      </button>
    </div>
  );
};

export default ProduktKarta;
