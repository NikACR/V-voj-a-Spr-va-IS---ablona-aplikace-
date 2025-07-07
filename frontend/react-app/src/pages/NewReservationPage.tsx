// src/pages/NewReservationPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

interface Option { id: number; label: string; }

const NewReservationPage: React.FC = () => {
  const [datumCas, setDatumCas] = useState('');
  const [pocetOsob, setPocetOsob] = useState(1);
  const [type, setType] = useState<'stul' | 'salonek' | 'akce'>('stul');
  const [tables, setTables] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [events, setEvents] = useState<Option[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    api.get<{ id_stul: number; cislo: number }[]>('/stul')
      .then(r => setTables(r.data.map(s => ({ id: s.id_stul, label: `Stůl č. ${s.cislo}` }))));
    api.get<{ id_salonek: number; nazev: string }[]>('/salonek')
      .then(r => setRooms(r.data.map(s => ({ id: s.id_salonek, label: s.nazev }))));
    api.get<{ id_akce: number; nazev: string }[]>('/akce')
      .then(r => setEvents(r.data.map(a => ({ id: a.id_akce, label: a.nazev }))));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { datum_cas: datumCas, pocet_osob: pocetOsob };
    if (type === 'stul') payload.id_stul = selected;
    if (type === 'salonek') payload.id_salonek = selected;
    if (type === 'akce') payload.id_akce = selected;
    await api.post('/rezervace', payload);
    // případné přesměrování nebo notifikace
  };

  const options = type === 'stul' ? tables : type === 'salonek' ? rooms : events;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-4">
      <div>
        <label className="block mb-1">Datum a čas</label>
        <input
          type="datetime-local"
          value={datumCas}
          onChange={e => setDatumCas(e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1">Počet osob</label>
        <input
          type="number"
          min={1}
          value={pocetOsob}
          onChange={e => setPocetOsob(+e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1">Typ rezervace</label>
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              name="type"
              value="stul"
              checked={type === 'stul'}
              onChange={() => { setType('stul'); setSelected(null); }}
            /> Stůl
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="salonek"
              checked={type === 'salonek'}
              onChange={() => { setType('salonek'); setSelected(null); }}
            /> Salónek
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="akce"
              checked={type === 'akce'}
              onChange={() => { setType('akce'); setSelected(null); }}
            /> Firemní akce
          </label>
        </div>
      </div>
      <div>
        <label className="block mb-1">
          {type === 'akce' ? 'Vyberte akci' : type === 'salonek' ? 'Vyberte salónek' : 'Vyberte stůl'}
        </label>
        <select
          value={selected ?? ''}
          onChange={e => setSelected(+e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        >
          <option value="" disabled>---</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Vytvořit rezervaci
      </button>
    </form>
  );
};

export default NewReservationPage;
