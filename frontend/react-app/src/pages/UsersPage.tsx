import React, { useState, useEffect, FormEvent } from 'react'
import api from '../utils/api'

interface Zakaznik {
  id_zakaznika: number
  jmeno: string
  prijmeni: string
  email: string
  telefon: string | null
}

interface FormZakaznik {
  jmeno: string
  prijmeni: string
  email: string
  telefon: string
  password: string
}

const UsersPage: React.FC = () => {
  const [users, setUsers]     = useState<Zakaznik[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [isEditing, setIsEditing]     = useState(false)
  const [editId, setEditId]           = useState<number | null>(null)
  const [formData, setFormData]       = useState<FormZakaznik>({ jmeno:'', prijmeni:'', email:'', telefon:'', password:'' })

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.get<Zakaznik[]>('/zakaznik')
      setUsers(resp.data)
    } catch {
      setError('Nepodařilo se načíst zákazníky.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.jmeno || !formData.prijmeni || !formData.email || !formData.password) return
    setLoading(true)
    try {
      await api.post('/zakaznik', formData)
      fetchUsers()
      setFormData({ jmeno:'', prijmeni:'', email:'', telefon:'', password:'' })
    } catch {
      setError('Chyba při vytváření zákazníka.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (u: Zakaznik) => {
    setIsEditing(true)
    setEditId(u.id_zakaznika)
    setFormData({ jmeno:u.jmeno, prijmeni:u.prijmeni, email:u.email, telefon:u.telefon||'', password:'' })
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    try {
      const payload: any = { jmeno:formData.jmeno, prijmeni:formData.prijmeni, email:formData.email }
      if (formData.telefon) payload.telefon = formData.telefon
      if (formData.password) payload.password = formData.password
      await api.put(`/zakaznik/${editId}`, payload)
      fetchUsers()
      setIsEditing(false)
      setEditId(null)
      setFormData({ jmeno:'', prijmeni:'', email:'', telefon:'', password:'' })
    } catch {
      alert('Chyba při aktualizaci.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Opravdu chcete smazat tohoto zákazníka?')) return
    setLoading(true)
    try {
      await api.delete(`/zakaznik/${id}`)
      fetchUsers()
    } catch {
      alert('Chyba při mazání.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="text-center mt-8">Načítám…</p>
  if (error)   return <p className="text-center text-red-600 mt-8">{error}</p>

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Správa zákazníků</h1>

      <form onSubmit={isEditing ? handleEdit : handleCreate}
            className="max-w-md mx-auto mb-8 bg-white p-6 rounded shadow">
        <h2 className="text-2xl mb-4">{isEditing ? 'Uprav zákazníka' : 'Přidej nového zákazníka'}</h2>

        <input type="text" placeholder="Jméno" value={formData.jmeno}
               onChange={e=>setFormData({...formData, jmeno:e.target.value})}
               className="w-full border px-3 py-2 mb-4" required />

        <input type="text" placeholder="Příjmení" value={formData.prijmeni}
               onChange={e=>setFormData({...formData, prijmeni:e.target.value})}
               className="w-full border px-3 py-2 mb-4" required />

        <input type="email" placeholder="Email" value={formData.email}
               onChange={e=>setFormData({...formData, email:e.target.value})}
               className="w-full border px-3 py-2 mb-4" required />

        <input type="text" placeholder="Telefon (volitelně)" value={formData.telefon}
               onChange={e=>setFormData({...formData, telefon:e.target.value})}
               className="w-full border px-3 py-2 mb-4" />

        <input type="password" placeholder={isEditing?'Nové heslo (volitelně)':'Heslo'}
               value={formData.password}
               onChange={e=>setFormData({...formData, password:e.target.value})}
               className="w-full border px-3 py-2 mb-4" {...(!isEditing && {required:true})} />

        <button type="submit"
                className={`px-4 py-2 text-white rounded ${
                  isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}>
          {isEditing ? 'Uložit' : 'Vytvořit'}
        </button>
        {isEditing && (
          <button type="button" onClick={()=>{setIsEditing(false);setEditId(null);setFormData({jmeno:'',prijmeni:'',email:'',telefon:'',password:''})}}
                  className="ml-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Zrušit
          </button>
        )}
      </form>

      <table className="w-full bg-white rounded shadow table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Jméno</th>
            <th className="border px-4 py-2">Příjmení</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Telefon</th>
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
              <td className="border px-4 py-2">{u.telefon || '–'}</td>
              <td className="border px-4 py-2 flex justify-center space-x-2">
                <button onClick={() => startEdit(u)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button onClick={() => handleDelete(u.id_zakaznika)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersPage
