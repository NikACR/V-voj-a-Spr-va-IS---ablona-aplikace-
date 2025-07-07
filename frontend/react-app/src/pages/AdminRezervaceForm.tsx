import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Table {
  id: number
  name: string
}

interface Reservation {
  id: number
  date: string
  people: number
  table: Table
}

export default function AdminRezervaceForm() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    api
      .get<Reservation[]>('/admin/reservations')
      .then(res => setReservations(res.data))
      .catch(() => setError('Nepodařilo se načíst rezervace.'))
  }, [])

  if (error) {
    return <p className="text-red-600 mt-4">{error}</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Správa rezervací</h1>
      <ul className="space-y-2">
        {reservations.map(r => (
          <li key={r.id} className="p-4 border rounded">
            {new Date(r.date).toLocaleString('cs-CZ')} — {r.people} osob — stůl {r.table.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
