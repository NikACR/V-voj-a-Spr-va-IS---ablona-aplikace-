import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Table {
  id_stolu: number;
  cislo: number;
}

const NewReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [persons, setPersons] = useState(1);
  const [tableId, setTableId] = useState<number | ''>('');

  // Načtení stolů
  useEffect(() => {
    api.get<Table[]>('/stul')
      .then(res => {
        setTables(res.data);
        setError(null);
      })
      .catch(() => {
        setError('Nepodařilo se načíst stoly.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rezervace', {
        datum_cas: dateTime,
        pocet_osob: persons,
        stul_id: tableId,
      });
      navigate('/reservations');
    } catch {
      setError('Chyba při vytváření rezervace.');
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded shadow"
      >
        <h1 className="text-xl font-bold mb-4">Nová rezervace</h1>

        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

        <label className="block mb-2">
          Datum a čas
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </label>

        <label className="block mb-2">
          Počet osob
          <input
            type="number"
            min={1}
            value={persons}
            onChange={e => setPersons(Number(e.target.value))}
            required
            className="w-full border p-2 rounded"
          />
        </label>

        <label className="block mb-4">
          Vyberte stůl
          <select
            value={tableId}
            onChange={e => setTableId(Number(e.target.value))}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">-- vyberte --</option>
            {tables.map(t => (
              <option key={t.id_stolu} value={t.id_stolu}>
                {t.cislo}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Rezervovat
        </button>
      </form>
    </div>
  );
};

export default NewReservationPage;
