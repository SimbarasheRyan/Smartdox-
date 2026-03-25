import { useEffect, useState } from 'react'
import { getDocuments, createDocument, archiveDocument, unarchiveDocument, softDeleteDocument, restoreDocument, hardDeleteDocument, getTags } from '../api'
import { useAuth } from '../context/AuthContext'
import './Documents.css'

export default function Documents() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', case_number: '', description: '', marker: '', file: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchDocs = () => {
    setLoading(true)
    const params = { q: search }
    if (filter === 'archived') params.is_archived = '1'
    else if (filter === 'deleted') params.is_deleted = '1'
    getDocuments(params).then(r => setDocs(r.data.results ?? r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchDocs() }, [search, filter])
  useEffect(() => { getTags().then(r => setTags(r.data.results ?? r.data)).catch(() => {}) }, [])

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await createDocument(fd)
      setShowModal(false); setForm({ title: '', case_number: '', description: '', marker: '', file: null })
      fetchDocs()
    } catch (err) {
      setError(err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Failed to create document.')
    } finally { setSaving(false) }
  }

  const action = async (fn, id) => { try { await fn(id); fetchDocs() } catch (e) { alert('Action failed') } }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Manage all court files and records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Upload Document</button>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search by title, case number..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-tabs">
          {['active','archived','deleted'].map(f => (
            <button key={f} className={'filter-tab' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? <div style={{textAlign:'center',padding:'40px'}}><div className="spinner" style={{margin:'0 auto'}} /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Case Number</th><th>Marker</th><th>Status</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr><td colSpan={6} className="empty-msg">No documents found.</td></tr>
                ) : docs.map(doc => (
                  <tr key={doc.id}>
                    <td><div className="doc-title">{doc.title}</div><div className="doc-desc">{doc.description}</div></td>
                    <td>{doc.case_number || '—'}</td>
                    <td>{doc.marker || '—'}</td>
                    <td>
                      <span className={'badge ' + (doc.is_deleted ? 'badge-red' : doc.is_archived ? 'badge-gold' : 'badge-green')}>
                        {doc.is_deleted ? 'Deleted' : doc.is_archived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        {!doc.is_deleted && !doc.is_archived && <button className="btn btn-sm btn-outline" onClick={() => action(archiveDocument, doc.id)}>Archive</button>}
                        {doc.is_archived && <button className="btn btn-sm btn-ghost" onClick={() => action(unarchiveDocument, doc.id)}>Unarchive</button>}
                        {!doc.is_deleted && <button className="btn btn-sm btn-danger" onClick={() => action(softDeleteDocument, doc.id)}>Delete</button>}
                        {doc.is_deleted && <button className="btn btn-sm btn-outline" onClick={() => action(restoreDocument, doc.id)}>Restore</button>}
                        {doc.is_deleted && user?.role === 'ADMIN' && <button className="btn btn-sm btn-danger" onClick={() => { if(window.confirm('Permanently delete?')) action(hardDeleteDocument, doc.id) }}>Purge</button>}
                      </div>
                    </td>
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
            <h2 className="modal-title">Upload Document</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Document title" required /></div>
              <div className="form-group"><label>Case Number</label><input value={form.case_number} onChange={e => setForm(f => ({...f, case_number: e.target.value}))} placeholder="e.g. CC001/2025" /></div>
              <div className="form-group"><label>Marker</label><input value={form.marker} onChange={e => setForm(f => ({...f, marker: e.target.value}))} placeholder="e.g. SimbaCT1" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description..." rows={3} style={{resize:'vertical'}} /></div>
              <div className="form-group"><label>File</label><input type="file" onChange={e => setForm(f => ({...f, file: e.target.files[0]}))} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
