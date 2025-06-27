import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface Reservation {
  id_rezervace: number;
  datum_cas: string;
  pocet_osob: number;
  stul: {
    id_stolu: number;
    cislo: number;
  };
}

const MyReservationsPage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Reservation[]>('/rezervace')         // bez ?zakaznik=...
      .then(res => {
        setReservations(res.data);
        setError(null);
      })
      .catch(() => {
        setError('Nepodařilo se načíst rezervace.');
      });
  }, [user]);

  if (error) {
    return <p className="text-red-500 text-center mt-8">{error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Moje rezervace</h1>
      {reservations.length === 0 ? (
        <p>Nemáte zatím žádné rezervace.</p>
      ) : (
        <ul className="space-y-2">
          {reservations.map(r => (
            <li key={r.id_rezervace} className="border p-4 rounded">
              <div><strong>Čas:</strong> {new Date(r.datum_cas).toLocaleString()}</div>
              <div><strong>Počet osob:</strong> {r.pocet_osob}</div>
              <div><strong>Stůl č.:</strong> {r.stul.cislo}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReservationsPage;
