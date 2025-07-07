import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Reservation {
  id_rezervace: number
  datum_cas: string   // ISO string
  pocet: number       // počet osob
  id_stul: number     // číslo stolu
}

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    api.get<Reservation[]>('/rezervace')
      .then(r => {
        setReservations(r.data)
        setError(null)
      })
      .catch(() => setError('Nepodařilo se načíst rezervace.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Načítám rezervace…</p>
  if (error)   return <p className="text-red-600">{error}</p>

  const now = new Date()

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Moje rezervace</h1>
      {reservations.length === 0 ? (
        <p>Ještě nemáte žádné rezervace.</p>
      ) : (
        reservations.map(r => {
          const dt = new Date(r.datum_cas)
          // lepší stavy
          const status = dt > now
            ? 'Očekávaná'
            : 'Proběhla'

          return (
            <div
              key={r.id_rezervace}
              className="border p-4 rounded mb-4 bg-white shadow"
            >
              <h2 className="text-lg font-semibold mb-2">
                Rezervace č. {r.id_rezervace}
              </h2>
              <p>
                <span className="font-medium">Čas:</span>{' '}
                {dt.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Počet osob:</span>{' '}
                {r.pocet}
              </p>
              <p>
                <span className="font-medium">Stůl č.:</span>{' '}
                {r.id_stul}
              </p>
              <p>
                <span className="font-medium">Stav:</span>{' '}
                {status}
              </p>
            </div>
          )
        })
      )}
    </div>
  )
}

export default MyReservationsPage
