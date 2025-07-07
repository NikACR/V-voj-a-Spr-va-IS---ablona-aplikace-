import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface User {
  id: number
  jmeno: string
  prijmeni: string
  email: string
  telefon: string | null
  roles: string[]
}

const UsersAdminPage: React.FC = () => {
  const [users, setUsers]       = useState<User[]>([])
  const [error, setError]       = useState<string | null>(null)
  const [jmeno, setJmeno]       = useState('')
  const [prijmeni, setPrijmeni] = useState('')
  const [email, setEmail]       = useState('')
  const [telefon, setTelefon]   = useState('')
  const [password, setPassword] = useState('')

  const fetchUsers = () => {
    api
      .get<User[]>('/users')   // ← opravena cesta z `/v1/users` na `/users`
      .then(res => setUsers(res.data))
      .catch(() => setError('Nepodařilo se načíst uživatele.'))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = async () => {
    try {
      await api.post('/users', {  // ← opravena cesta z `/v1/users` na `/users`
        jmeno,
        prijmeni,
        email,
        telefon: telefon || null,
        password,
        roles: ['user'],         // pevně jen role "user"
      })
      // vyčistí formulář
      setJmeno('')
      setPrijmeni('')
      setEmail('')
      setTelefon('')
      setPassword('')
      fetchUsers()
    } catch {
      setError('Chyba při ukládání uživatele.')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`) // ← opravena cesta
      fetchUsers()
    } catch {
      setError('Chyba při mazání uživatele.')
    }
  }

  if (error) {
    return <p className="text-red-600 mt-4">{error}</p>
  }

  return (
    <div className="mt-6 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Správa uživatelů</h1>

      {/* Formulář pro přidání nového uživatele */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Jméno"
          value={jmeno}
          onChange={e => setJmeno(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Příjmení"
          value={prijmeni}
          onChange={e => setPrijmeni(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="col-span-2 border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Telefon"
          value={telefon}
          onChange={e => setTelefon(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={handleAdd}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Přidat uživatele
      </button>

      {/* Tabulka stávajících uživatelů */}
      <table className="w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Jméno</th>
            <th className="border px-4 py-2">Příjmení</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Telefon</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Akce</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{u.id}</td>
              <td className="border px-4 py-2">{u.jmeno}</td>
              <td className="border px-4 py-2">{u.prijmeni}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.telefon ?? '–'}</td>
              <td className="border px-4 py-2">
                {u.roles
                  .map(r =>
                    r === 'admin' ? 'Administrátor' :
                    r === 'staff' ? 'Pracovník' :
                    'Uživatel'
                  )
                  .join(', ')
                }
              </td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersAdminPage
