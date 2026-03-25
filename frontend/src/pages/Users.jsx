import { useEffect, useState } from 'react'
import { getUsers, createUser, activateUser, deactivateUser, setPassword } from '../api'
import './Users.css'

const ROLES = ['CLERK','JUDGE','REGISTRAR','ADMIN']

export default function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ username:'', email:'', password:'', role:'CLERK' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetch = () => { setLoading(true); getUsers(search).then(r => setUsers(r.data.results ?? r.data)).finally(() => setLoading(false)) }
  useEffect(() => { fetch() }, [search])

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try { await createUser(form); setShowModal(false); setForm({ username:'', email:'', password:'', role:'CLERK' }); fetch() }
    catch (err) { setError(err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Failed.') }
    finally { setSaving(false) }
  }

  const toggle = async (u) => { try { await (u.is_active ? deactivateUser(u.id) : activateUser(u.id)); fetch() } catch { alert('Failed') } }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Users</h1><p className="page-subtitle">Manage system users and roles</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>
      <div className="toolbar">
        <input className="search-input" placeholder="Search by username or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {loading ? <div style={{textAlign:'center',padding:'40px'}}><div className="spinner" style={{margin:'0 auto'}} /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan={5} className="empty-msg">No users found.</td></tr>
                : users.map(u => (
                  <tr key={u.id}>
                    <td><div className="user-cell"><div className="user-avatar-sm">{u.username[0].toUpperCase()}</div>{u.username}</div></td>
                    <td>{u.email || '—'}</td>
                    <td><span className="badge badge-green">{u.role}</span></td>
                    <td><span className={'badge ' + (u.is_active ? 'badge-green' : 'badge-red')}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td><div className="action-btns">
                      <button className={'btn btn-sm ' + (u.is_active ? 'btn-danger' : 'btn-outline')} onClick={() => toggle(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => { if(e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <h2 className="modal-title">Add New User</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Username *</label><input value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
              <div className="form-group"><label>Role</label><select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
              <div className="form-group"><label>Password *</label><input type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
