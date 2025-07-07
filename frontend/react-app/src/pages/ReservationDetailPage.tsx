// src/pages/ReservationDetailPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Spinner from '../components/Spinner'

interface Reservation {
  id: number
  user: { name: string; email: string }
  datetime: string
  table: { name: string }
  people: number
  notes?: string
}

const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    api
      .get<Reservation>(`/reservations/${id}`)
      .then(res => setReservation(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600">Chyba při načítání: {error.message}</p>
  if (!reservation) return <p>Rezervace nenalezena.</p>

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Zpět na seznam rezervací
      </button>

      <h1 className="text-2xl font-semibold mb-4">Rezervace č. {reservation.id}</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-3">
        <p><strong>Klient:</strong> {reservation.user.name} ({reservation.user.email})</p>
        <p><strong>Datum a čas:</strong> {new Date(reservation.datetime).toLocaleString('cs-CZ')}</p>
        <p><strong>Stůl:</strong> {reservation.table.name}</p>
        <p><strong>Počet osob:</strong> {reservation.people}</p>
        <p><strong>Poznámky:</strong> {reservation.notes || '–'}</p>
      </div>
    </div>
  )
}

export default ReservationDetailPage
