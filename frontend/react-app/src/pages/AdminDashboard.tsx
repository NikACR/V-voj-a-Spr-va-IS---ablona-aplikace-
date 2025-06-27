import React from 'react'
import { Link } from 'react-router-dom'

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <ul className="space-y-4">
        <li>
          <Link to="/admin/pracovnici" className="text-blue-600 hover:underline">
            Správa pracovníků
          </Link>
        </li>
        <li>
          <Link to="/admin/rezervace" className="text-blue-600 hover:underline">
            Vytvořit / upravit rezervaci
          </Link>
        </li>
        <li>
          <Link to="/admin/schuzky" className="text-blue-600 hover:underline">
            Vytvořit / upravit schůzku
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default AdminDashboard
