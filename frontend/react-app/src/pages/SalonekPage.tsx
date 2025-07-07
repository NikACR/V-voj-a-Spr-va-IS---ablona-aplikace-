import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Table {
  id: number
  name: string
  capacity: number
}

export default function SalonekPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    api
      .get<Table[]>('/tables')
      .then(res => setTables(res.data))
      .catch(() => setError('Nepodařilo se načíst stoly.'))
  }, [])

  if (error) {
    return <p className="text-red-600 mt-4">{error}</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Salónek</h1>
      <ul className="space-y-2">
        {tables.map(t => (
          <li key={t.id} className="p-4 border rounded">
            <strong>{t.name}</strong> (kapacita: {t.capacity})
          </li>
        ))}
      </ul>
    </div>
  )
}
