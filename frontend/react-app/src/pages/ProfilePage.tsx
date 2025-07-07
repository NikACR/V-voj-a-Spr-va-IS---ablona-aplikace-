// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

interface PointsResponse {
  id_ucet: number
  id_zakaznika: number
  body: number
  datum_zalozeni: string
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true)
        const res = await api.get<PointsResponse>('/users/me/points')
        setPoints(res.data.body)
      } catch (e) {
        console.error(e)
        setError('Nepodařilo se načíst stav bodů.')
      } finally {
        setLoading(false)
      }
    }

    fetchPoints()
  }, [user.id]) // znovu načíst, pokud se přihlášení/uživatel změní

  const remaining = points !== null ? Math.max(400 - points, 0) : null

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Můj profil</h2>
      <p><strong>Jméno:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Telefon:</strong> {user.phone || '–'}</p>

      <hr className="my-4" />

      {loading ? (
        <p>Načítám body…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <p><strong>Body:</strong> {points}</p>
          {points! >= 400 ? (
            <p className="text-green-600">Máte dostatek bodů na slevu!</p>
          ) : (
            <p>Zbývá do slevy 400 bodů: {remaining} bodů.</p>
          )}
        </>
      )}
    </div>
  )
}

export default ProfilePage
