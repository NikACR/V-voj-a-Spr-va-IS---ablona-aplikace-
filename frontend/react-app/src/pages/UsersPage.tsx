// src/pages/UsersPage.tsx

import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface User {
  id_zakaznika: number
  jmeno: string
  prijmeni: string
  email: string
  telefon?: string
  roles?: string[]
}

const roleNames: Record<string, string> = {
  user:  'Uživatel',
  staff: 'Pracovník',
  admin: 'Administrátor'
}

const UsersPage: React.FC = () => {
  const [users, setUsers]       = useState<User[]>([])
  const [jmeno, setJmeno]       = useState('')
  const [prijmeni, setPrijmeni] = useState('')
  const [email, setEmail]       = useState('')
  const [telefon, setTelefon]   = useState('')
  const [password, setPassword] = useState('')
  const [editId, setEditId]     = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/zakaznik')
      setUsers(res.data)
    } catch {
      alert('Nepodařilo se načíst uživatele.')
    }
  }

  const resetForm = () => {
    setEditId(null)
    setJmeno('')
    setPrijmeni('')
    setEmail('')
    setTelefon('')
    setPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId !== null) {
        // aktualizace existujícího uživatele
        const body: any = { jmeno, prijmeni, email, telefon }
        if (password) body.password = password
        await api.put(`/zakaznik/${editId}`, body)
      } else {
        // vytvoření nového uživatele (role backend přiřadí automaticky user)
        await api.post('/zakaznik', { jmeno, prijmeni, email, telefon, password })
      }
      resetForm()
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Chyba při ukládání uživatele')
    }
  }

  const handleEdit = (u: User) => {
    setEditId(u.id_zakaznika)
    setJmeno(u.jmeno)
    setPrijmeni(u.prijmeni)
    setEmail(u.email)
    setTelefon(u.telefon || '')
    setPassword('')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Opravdu smazat tohoto uživatele?')) return
    try {
      await api.delete(`/zakaznik/${id}`)
      fetchUsers()
    } catch {
      alert('Chyba při mazání uživatele.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Správa uživatelů</h1>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <input
          type="text"
          placeholder="Jméno"
          required
          value={jmeno}
          onChange={e => setJmeno(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Příjmení"
          required
          value={prijmeni}
          onChange={e => setPrijmeni(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="col-span-1 md:col-span-2 border px-3 py-2 rounded"
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
          placeholder={editId ? 'Nové heslo (nepovinné)' : 'Heslo'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <div className="col-span-1 md:col-span-2 flex space-x-2">
          <button
            type="submit"
            className={`flex-1 py-2 rounded text-white ${
              editId !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {editId !== null ? 'Upravit uživatele' : 'Přidat uživatele'}
          </button>
          {editId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Zrušit
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow table-auto border-collapse">
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
              <tr key={u.id_zakaznika} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{u.id_zakaznika}</td>
                <td className="border px-4 py-2">{u.jmeno}</td>
                <td className="border px-4 py-2">{u.prijmeni}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.telefon || '-'}</td>
                <td className="border px-4 py-2">
                  {(u.roles ?? []).map(r => roleNames[r] || r).join(', ') || 'Uživatel'}
                </td>
                <td className="border px-4 py-2 space-x-2 text-center">
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id_zakaznika)}
                    className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersPage
