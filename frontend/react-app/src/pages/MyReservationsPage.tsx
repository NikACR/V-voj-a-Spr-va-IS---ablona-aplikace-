// src/pages/MyReservationsPage.tsx

import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Reservation {
  id_rezervace: number
  datum_cas:    string
  pocet_osob:   number
  stul:         { cislo: number }
}

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Reservation[]>('/rezervace')
      .then(res => {
        setReservations(res.data)
        setError(null)
      })
      .catch(() => setError('Nepodařilo se načíst rezervace.'))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return <p className="text-red-500 text-center mt-8">{error}</p>
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[150px] bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Moje rezervace</h1>
      {reservations.length === 0 ? (
        <p className="text-gray-600">Nemáte žádné rezervace.</p>
      ) : (
        <ul className="space-y-4">
          {reservations.map(r => (
            <li key={r.id_rezervace} className="border rounded-lg p-4 shadow-sm">
              <p><strong>Datum:</strong> {new Date(r.datum_cas).toLocaleString()}</p>
              <p><strong>Počet osob:</strong> {r.pocet_osob}</p>
              <p><strong>Stůl č.:</strong> {r.stul.cislo}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyReservationsPage
