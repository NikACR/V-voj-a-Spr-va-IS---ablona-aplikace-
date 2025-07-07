import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Meeting {
  id: number
  subject: string
  time: string
}

export default function AdminSchuzkaForm() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    api
      .get<Meeting[]>('/admin/meetings')
      .then(res => setMeetings(res.data))
      .catch(() => setError('Nepodařilo se načíst schůzky.'))
  }, [])

  if (error) {
    return <p className="text-red-600 mt-4">{error}</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Správa schůzek</h1>
      <ul className="space-y-2">
        {meetings.map(m => (
          <li key={m.id} className="p-4 border rounded">
            {m.subject} — {new Date(m.time).toLocaleString('cs-CZ')}
          </li>
        ))}
      </ul>
    </div>
  )
}
